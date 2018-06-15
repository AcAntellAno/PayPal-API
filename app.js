const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id:
    'AbGX-AzvcdE30B3gODmzPjPLnZ3mu2D7AGX6pHuwoyylupqL-hXDfkvleqLN3oIGtZkBH8Oc1DVNNUmf',
  client_secret:
    'EHWs6xj69wG09Uw2GmKcYMP1zkBDqH_eCLZiK2Ol5IzSdq3kAULTxKyeJXaBIbF6frJq_KBmid9woCPV'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));
app.post('/pay', (req, res) => {
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel'
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'Tow Truck Payment',
              sku: '001',
              price: '35.00',
              currency: 'USD',
              quantity: 1
            }
          ]
        },
        amount: {
          currency: 'USD',
          total: '35.00'
        },
        description: 'Tow Truck Payment.'
      }
    ]
  };
  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      console.log(error);
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: '35.00'
        }
      }
    ]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.render('success');
    }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('The Magic is on Port 3000'));
