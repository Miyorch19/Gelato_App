<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket #{{ $sale->id }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            width: 240px;
            padding: 5px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px dashed #000;
        }
        
        .business-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .business-info {
            font-size: 9px;
            line-height: 1.2;
        }
        
        .ticket-info {
            margin: 8px 0;
            font-size: 10px;
        }
        
        .ticket-info div {
            margin: 2px 0;
        }
        
        .separator {
            border-top: 1px dashed #000;
            margin: 8px 0;
        }
        
        .items-table {
            width: 100%;
            margin: 8px 0;
        }
        
        .items-header {
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            margin-bottom: 3px;
        }
        
        .item-row {
            margin: 3px 0;
        }
        
        .item-name {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 1px;
        }
        
        .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
        }
        
        .totals {
            margin-top: 8px;
            padding-top: 5px;
            border-top: 1px solid #000;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 10px;
        }
        
        .total-final {
            font-size: 12px;
            font-weight: bold;
            padding-top: 3px;
            border-top: 1px dashed #000;
            margin-top: 3px;
        }
        
        .footer {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            font-size: 9px;
        }
        
        .thank-you {
            font-weight: bold;
            margin: 5px 0;
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
    </div>
    
    <!-- Ticket Info -->
    <div class="ticket-info">
        <div><strong>TICKET #{{ str_pad($sale->id, 6, '0', STR_PAD_LEFT) }}</strong></div>
        <div>Fecha: {{ $sale->created_at->format('d/m/Y H:i') }}</div>
        <div>Cajero: {{ $sale->employee->name }}</div>
        <div>Pago: {{ $sale->paymentMethod->name }}</div>
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
        
        @foreach($sale->saleItems as $item)
        <div class="item-row">
            <div class="item-name">{{ $item->product->name }}</div>
            <div class="item-details">
                <span>{{ $item->quantity }} x ${{ number_format($item->unit_price, 2) }}</span>
                <span>${{ number_format($item->subtotal, 2) }}</span>
            </div>
        </div>
        @endforeach
    </div>
    
    <!-- Totals -->
    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${{ number_format($sale->total, 2) }}</span>
        </div>
        
        <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>${{ number_format($sale->total, 2) }}</span>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="thank-you">¡Gracias por su compra!</div>
        <div style="margin-top: 5px;">
            Ticket válido como comprobante de compra
        </div>
    </div>
</body>
</html>