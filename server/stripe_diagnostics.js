const Stripe = require('stripe');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const runDiagnostics = async () => {
    console.log('--- STRIPE DIAGNOSTICS ---');
    console.log('Key:', process.env.STRIPE_SECRET_KEY ? 'Present' : 'MISSING');

    try {
        // 1. Test Key Retrieval
        const account = await stripe.accounts.retrieve();
        console.log('Account found:', account.id);
        console.log('Country:', account.country);
        console.log('Default Currency:', account.default_currency);
        console.log('Capabilities:', JSON.stringify(account.capabilities, null, 2));

        // 2. Test Session Creation with Mock Data
        console.log('\nTesting session creation...');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Diagnostic Test 100 INR' },
                    unit_amount: 10000,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:5173/success',
            cancel_url: 'http://localhost:5173/cancel',
        });
        console.log('Session creation successful:', session.id);
        console.log('Session URL:', session.url);

    } catch (error) {
        console.error('\n!!! DIAGNOSTIC FAILED !!!');
        console.error('Error Code:', error.code);
        console.error('Error Type:', error.type);
        console.error('Error Message:', error.message);
        if (error.raw) {
            console.error('Raw Error:', JSON.stringify(error.raw, null, 2));
        }
    }
};

runDiagnostics();
