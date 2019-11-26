import {Aurelia, inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator'
import {PaymentInfo} from "./payment-info";
import {HttpClient, json} from 'aurelia-fetch-client';


@inject(EventAggregator, PaymentInfo, HttpClient)
export  class StripePayment {
    public card;
    public stripe;
    public eventAggregator;
    public api;
    public publicKey;
    public paymentInfo;

    constructor(eventAggregator, paymentInfo, http: HttpClient) {
        this.eventAggregator = eventAggregator;
        this.paymentInfo = paymentInfo;
		this.http = http;
        this.paymentInfo.amount = 25;
        this.eventAggregator.subscribe('loadStripe', payload => {
            this.publicKey = 'pk_test_.......';
            this.loadStripe();
        });
    }

    afterLoadingStripe() {
        this.stripe = Stripe(this.publicKey);
        var elements = this.stripe.elements();
        this.card = elements.create('card', {
            style: {
                base: {
                    iconColor: '#666EE8',
                    color: '#31325F',
                    lineHeight: '40px',
                    fontWeight: 300,
                    fontFamily: 'Helvetica Neue',
                    fontSize: '15px',

                    '::placeholder': {
                        color: '#CFD7E0',
                    },
                },
            }
        });
        this.card.mount('#card-element');
    }

    getToken() {
        let context = this;
        this.stripe.createToken(this.card).then(function (result) {
            if (result.error) {
            } else {
                context.paymentInfo.token = result;
                context.submitPaymentInfo();
            }
        });
    }

    submitPaymentInfo() {
        this.http.fetch('/api/add-payment',{
					method: "post",
					body: json(this.paymentInfo)
			})
            .then(response => response.json())
            .then(result => {
                if(result){
                    this.eventAggregator.publish('stripeResult', result);
                    document.getElementById('stripe-modal-close').click();
                }
            });
        return;
    }

    loadStripe() {
        var script = document.createElement('script');
        let context = this;
        script.onload = function () {
            context.afterLoadingStripe();
        };
        script.src = "https://js.stripe.com/v3/";
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}
