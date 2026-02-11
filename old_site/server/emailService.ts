import nodemailer from 'nodemailer';
import type { SiteSettings } from '@shared/schema';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

export async function sendEmail(settings: SiteSettings, options: EmailOptions) {
  // Validar se as configurações SMTP estão disponíveis
  if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPassword) {
    throw new Error('Configurações SMTP não encontradas. Configure o SMTP nas configurações do site.');
  }

  console.log('🔧 Configurando transporter de email...');
  console.log('Host:', settings.smtpHost);
  console.log('Port:', settings.smtpPort);
  console.log('User:', settings.smtpUser);
  console.log('Secure:', settings.smtpSecure);

  // Para porta 587, usar secure: false com STARTTLS
  // Para porta 465, usar secure: true com SSL
  const isSecure = settings.smtpPort === 465 ? true : false;

  // Criar transporter do nodemailer
  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: isSecure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
    tls: {
      // Não falhar em certificados inválidos (útil para desenvolvimento)
      rejectUnauthorized: false
    },
    debug: true, // Habilitar logs detalhados
    logger: true // Habilitar logger
  });

  console.log('📧 Verificando conexão SMTP...');

  try {
    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso!');
  } catch (verifyError) {
    console.error('❌ Erro ao verificar conexão SMTP:', verifyError);
    throw verifyError;
  }

  console.log('📤 Enviando email...');

  // Enviar email
  const info = await transporter.sendMail({
    from: `"${settings.browserTabName || 'Cartório'}" <${settings.smtpUser}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });

  console.log('✅ Email enviado com sucesso! ID:', info.messageId);
  return info;
}

export function formatContactEmailHtml(data: {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  anexos?: string[];
}) {
  let anexosHtml = '';
  if (data.anexos && data.anexos.length > 0) {
    const baseUrl = 'https://cartorioderiodasostras.com.br';

    const anexosListHtml = data.anexos.map((anexo) => {
      const fileName = anexo.split('/').pop() || 'arquivo';
      const fullUrl = `${baseUrl}${anexo}`;

      return `
        <div style="margin-bottom: 10px; padding: 12px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">📎</span>
            <div style="flex: 1;">
              <a href="${fullUrl}" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500; display: block;" target="_blank">
                ${fileName}
              </a>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">
                Clique para baixar
              </p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    anexosHtml = `
      <div style="margin-top: 20px;">
        <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 12px;">Anexos (${data.anexos.length}):</h3>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
          ${anexosListHtml}
        </div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Nova Mensagem de Contato</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 5px;">Nome:</h3>
          <p style="margin: 0; font-size: 15px;">${data.nome}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 5px;">Email:</h3>
          <p style="margin: 0; font-size: 15px;">
            <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 5px;">Telefone:</h3>
          <p style="margin: 0; font-size: 15px;">
            <a href="tel:${data.telefone}" style="color: #2563eb; text-decoration: none;">${data.telefone}</a>
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 5px;">Mensagem:</h3>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 15px; white-space: pre-wrap;">${data.mensagem}</p>
          </div>
        </div>

        ${anexosHtml}
      </div>

      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 13px;">
        <p style="margin: 0;">Esta é uma mensagem automática do formulário de contato do site.</p>
      </div>
    </body>
    </html>
  `;
}

export function formatSolicitacaoEmailHtml(data: {
  tipoSolicitacao: string;
  nomeSolicitacao: string;
  dadosFormulario: any;
}) {
  // Organizar dados do formulário em HTML
  const dadosHtml = Object.entries(data.dadosFormulario)
    .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => {
      // Formatar o nome do campo (remover camelCase)
      const fieldName = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      // Se o valor for um array (documentos), formatar como lista
      if (Array.isArray(value)) {
        const baseUrl = 'https://cartorioderiodasostras.com.br';
        const filesHtml = value.map((filePath: string) => {
          const fileName = filePath.split('/').pop() || 'arquivo';
          const fullUrl = `${baseUrl}${filePath}`;
          return `
            <div style="margin-bottom: 8px; padding: 8px; background-color: #f9fafb; border-radius: 4px;">
              <a href="${fullUrl}" style="color: #2563eb; text-decoration: none; font-size: 13px;" target="_blank">
                📎 ${fileName}
              </a>
            </div>
          `;
        }).join('');

        return `
          <div style="margin-bottom: 16px;">
            <h4 style="color: #1e3a8a; font-size: 14px; margin-bottom: 8px; font-weight: 600;">${fieldName}:</h4>
            <div>${filesHtml}</div>
          </div>
        `;
      }

      return `
        <div style="margin-bottom: 16px;">
          <h4 style="color: #1e3a8a; font-size: 14px; margin-bottom: 4px; font-weight: 600;">${fieldName}:</h4>
          <p style="margin: 0; font-size: 14px; color: #374151;">${value}</p>
        </div>
      `;
    }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Nova Solicitação</h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${data.nomeSolicitacao}</p>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        ${dadosHtml}
      </div>

      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 13px;">
        <p style="margin: 0;">Esta é uma mensagem automática do formulário de solicitações do site.</p>
      </div>
    </body>
    </html>
  `;
}
