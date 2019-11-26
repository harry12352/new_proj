<?php

namespace App\Http\Controllers;

use App\UserType;
use Illuminate\Http\Request;
use Stripe\Charge;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function addPayment(Request $request){
        Stripe::setApiKey(env('STRIPE_SECRET'));
        $amount = $request->amount;
        Charge::create ([
            "amount" => $amount * 100,
            "currency" => "usd",
            "source" => $request->token['token']['id'],
            "description" => "Premium user payment"
        ]);
        $userType = new UserType();
        $userType->id_user = $request->userId;
        $userType->type = 'Premium';
        $result = $userType->save();
        return json_encode($result);
    }
}
