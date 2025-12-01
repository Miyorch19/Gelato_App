<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f0e8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #e85d75 0%, #d44a63 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 40px 30px;
        }
        .info-row {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #55110a;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .value {
            color: #333;
            font-size: 16px;
        }
        .message-box {
            background-color: #f5f0e8;
            border-left: 4px solid #e85d75;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .footer {
            background-color: #f5f0e8;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 8px;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍰 Nuevo Mensaje de Contacto</h1>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
                Has recibido un nuevo mensaje desde el formulario de contacto de tu sitio web.
            </p>

            <div class="info-row">
                <div class="label">👤 Nombre</div>
                <div class="value">{{ $contactData['name'] }}</div>
            </div>

            <div class="info-row">
                <div class="label">📧 Email</div>
                <div class="value">
                    <a href="mailto:{{ $contactData['email'] }}" style="color: #e85d75; text-decoration: none;">
                        {{ $contactData['email'] }}
                    </a>
                </div>
            </div>

            @if(!empty($contactData['phone']))
            <div class="info-row">
                <div class="label">📱 Teléfono</div>
                <div class="value">
                    <a href="tel:{{ $contactData['phone'] }}" style="color: #e85d75; text-decoration: none;">
                        {{ $contactData['phone'] }}
                    </a>
                </div>
            </div>
            @endif

            <div class="info-row">
                <div class="label">📌 Asunto</div>
                <div class="value">{{ $contactData['subject'] }}</div>
            </div>

            <div class="label" style="margin-top: 30px;">💬 Mensaje</div>
            <div class="message-box">
                {{ $contactData['message'] }}
            </div>

            <div style="margin-top: 40px; padding: 20px; background-color: #fff9e6; border-radius: 8px; border: 1px solid #ffd700;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    <strong>💡 Consejo:</strong> Puedes responder directamente a este email para contactar al cliente.
                </p>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 10px 0;">
                <strong>Gelato Pastelería</strong>
            </p>
            <p style="margin: 0; color: #999; font-size: 12px;">
                Email recibido el {{ date('d/m/Y H:i:s') }}
            </p>
        </div>
    </div>
</body>
</html>