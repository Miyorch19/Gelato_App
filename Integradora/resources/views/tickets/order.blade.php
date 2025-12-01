<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket #{{ $order->id }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Consolas', monospace;
            font-size: 14px;
            font-weight: bold;
            line-height: 1.2;
            color: #000;
            width: 180px;
            padding: 5px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px dashed #000;
        }
        
        .business-name {
            font-family: "Archivo Black", sans-serif;
            font-size: 24px;
            font-weight: 400;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .business-info {
            font-size: 13px;
            font-weight: bold;
            line-height: 1.2;
        }
        
        .ticket-info {
            margin: 10px 0;
            font-size: 13px;
            font-weight: bold;
        }
        
        .ticket-info div {
            margin: 3px 0;
        }
        
        .separator {
            border-top: 1px dashed #000;
            margin: 10px 0;
        }
        
        .items-table {
            width: 100%;
            margin: 10px 0;
        }
        
        .items-header {
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
            font-size: 13px;
        }
        
        .item-row {
            margin: 5px 0;
        }
        
        .item-name {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: bold;
        }
        
        .delivery-info {
            margin: 10px 0;
            padding: 5px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 2px;
        }
        
        .delivery-info-title {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .delivery-info-text {
            font-size: 12px;
            font-weight: bold;
            line-height: 1.3;
        }
        
        .totals {
            margin-top: 10px;
            padding-top: 5px;
            border-top: 1px solid #000;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 13px;
            font-weight: bold;
        }
        
        .total-final {
            font-size: 16px;
            font-weight: bold;
            padding-top: 5px;
            border-top: 1px dashed #000;
            margin-top: 5px;
        }
        
        .footer {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            font-size: 12px;
            font-weight: bold;
        }
        
        .thank-you {
            font-weight: bold;
            margin: 5px 0;
        }
        
        .status-badge {
            display: inline-block;
            padding: 3px 6px;
            background-color: #e0e0e0;
            border-radius: 2px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="business-name">{{ $business_name }}</div>
        <div class="business-info">Ticket Pedido Online</div>
    </div>
    
    <!-- Ticket Info -->
    <div class="ticket-info">
        <div><strong>PEDIDO #{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</strong></div>
        <div>Fecha: {{ $order->created_at->format('d/m/Y H:i') }}</div>
        <div>Cliente: {{ $order->user->name }}</div>
        <div>Tel: {{ $order->user->phone }}</div>
        <div>Pago: {{ $order->paymentMethod->name }}</div>
        <div>Estado: <span class="status-badge">{{ strtoupper($order->deliveryStatus->name) }}</span></div>
        @if($order->paypal_order_id)
        <div style="font-size: 11px; margin-top: 3px;">PayPal: {{ substr($order->paypal_order_id, 0, 15) }}...</div>
        @endif
    </div>
    
    <div class="separator"></div>
    
    <!-- Delivery Address -->
    <div class="delivery-info">
        <div class="delivery-info-title">Entrega:</div>
        <div class="delivery-info-text">
            <div>{{ $order->address->street }} {{ $order->address->number }}</div>
            <div>{{ $order->address->neighborhood }}</div>
            <div>{{ $order->address->city }}, {{ $order->address->state }}</div>
            <div>CP: {{ $order->address->postal_code }}</div>
            @if($order->address->reference)
            <div><strong>Ref:</strong> {{ $order->address->reference }}</div>
            @endif
        </div>
        
        @if($order->deliveryPerson)
        <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #ccc;">
            <div class="delivery-info-title">Repartidor:</div>
            <div class="delivery-info-text">{{ $order->deliveryPerson->name }}</div>
        </div>
        @endif
    </div>
    
    <div class="separator"></div>
    
    <!-- Items -->
    <div class="items-table">
        <div class="items-header">
            <div style="display: flex; justify-content: space-between;">
                <span>Producto</span>
                <span>Total</span>
            </div>
        </div>
        
        @foreach($order->orderItems as $item)
        <div class="item-row">
            @if($item->product_type === 'base' && $item->baseProduct)
                <div class="item-name">{{ $item->baseProduct->name }}</div>
            @elseif($item->product_type === 'custom' && $item->customProduct)
                <div class="item-name">Pastel Personalizado</div>
                <div style="font-size: 13px; margin-left: 5px; font-weight: bold;">
                    - Sabor: {{ $item->customProduct->flavor->name }}
                    @if($item->customProduct->size) • Tam: {{ $item->customProduct->size->name }} @endif
                    @if($item->customProduct->filling) • Rell: {{ $item->customProduct->filling->name }} @endif
                </div>
            @else
                <div class="item-name">{{ $item->product_name ?? 'Producto' }}</div>
            @endif
            
            <div class="item-details">
                <span>{{ $item->quantity }}x ${{ number_format($item->unit_price, 2) }}</span>
                <span>${{ number_format($item->subtotal, 2) }}</span>
            </div>
        </div>
        @endforeach
    </div>
    
    <!-- Totals -->
    <div class="totals">
        @php
            $subtotal = $order->orderItems->sum('subtotal');
            $shipping = 50.00;
        @endphp
        
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${{ number_format($subtotal, 2) }}</span>
        </div>
        
        <div class="total-row">
            <span>Envio:</span>
            <span>${{ number_format($shipping, 2) }}</span>
        </div>
        
        <div class="total-row total-final">
            <span>TOTAL PAGADO:</span>
            <span>${{ number_format($order->total, 2) }}</span>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="thank-you">¡Gracias por tu compra!</div>
        <div>Comprobante valido</div>
        <div>Rastrea tu pedido online</div>
    </div>
</body>
</html>