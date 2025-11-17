import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`✅ Email enviado para ${options.to}`);
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
}

const severityLabels: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica'
};

const severityDeadlines: Record<string, number> = {
  BAIXA: 5,
  MEDIA: 4,
  ALTA: 3,
  CRITICA: 2
};

export async function sendNCCreationEmail(
  ncTitle: string,
  ncDescription: string,
  checklistItemCode: string,
  checklistItemTitle: string,
  severity: string = 'MEDIA',
  responsible?: string,
  assignedToEmail?: string
): Promise<void> {
  const recipient = assignedToEmail || process.env.DEFAULT_QUALITY_EMAIL || '';
  
  const severityLabel = severityLabels[severity] || 'Média';
  const deadline = severityDeadlines[severity] || 4;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 15px; border-radius: 5px; }
        .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 5px; }
        .info-item { margin-bottom: 15px; }
        .info-label { font-weight: bold; color: #1f2937; }
        .info-value { color: #4b5563; margin-top: 5px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.9em; color: #6b7280; }
        .severity-badge { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
        .severity-baixa { background-color: #dbeafe; color: #1e40af; }
        .severity-media { background-color: #fef3c7; color: #92400e; }
        .severity-alta { background-color: #fee2e2; color: #991b1b; }
        .severity-critica { background-color: #7f1d1d; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Notificação de Não Conformidade</h2>
        </div>
        
        <div class="content">
          <p>Prezado(a) ${responsible || 'Responsável'},</p>
          
          <p>Durante a auditoria de qualidade realizada, foi identificada a seguinte Não Conformidade (NC) de acordo com o checklist de avaliação.</p>
          
          <div class="info-item">
            <div class="info-label">Item avaliado:</div>
            <div class="info-value">${checklistItemCode} - ${checklistItemTitle}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Situação encontrada:</div>
            <div class="info-value">${ncDescription}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Critério:</div>
            <div class="info-value">Checklist de Medição e Análise - ${checklistItemCode}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Classificação:</div>
            <div class="info-value">
              <span class="severity-badge severity-${severity.toLowerCase()}">${severityLabel}</span>
            </div>
          </div>
          
          ${responsible ? `
          <div class="info-item">
            <div class="info-label">Responsável:</div>
            <div class="info-value">${responsible}</div>
          </div>
          ` : ''}
          
          <div class="info-item">
            <div class="info-label">Prazo para correção:</div>
            <div class="info-value">${deadline} dias úteis</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Recomendação de correção:</div>
            <div class="info-value">Por favor, analise a não conformidade identificada e implemente as ações corretivas necessárias dentro do prazo estabelecido.</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Esta é uma notificação automática do Sistema de Auditoria de Qualidade.</p>
          <p>Para mais detalhes, acesse o sistema e visualize a NC completa.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: recipient,
    subject: `Notificação de Não Conformidade - ${checklistItemCode}`,
    html,
  });
}

export async function sendNCStatusChangeEmail(
  ncTitle: string,
  oldStatus: string,
  newStatus: string,
  assignedToEmail?: string
): Promise<void> {
  if (!assignedToEmail) return;

  const html = `
    <h2>Status de Não Conformidade Atualizado</h2>
    <p><strong>Título:</strong> ${ncTitle}</p>
    <p><strong>Status Anterior:</strong> ${oldStatus}</p>
    <p><strong>Novo Status:</strong> ${newStatus}</p>
    <hr>
    <p><em>Esta é uma notificação automática do Sistema de Auditoria de Qualidade.</em></p>
  `;

  await sendEmail({
    to: assignedToEmail,
    subject: `Status da NC Alterado: ${ncTitle}`,
    html,
  });
}
