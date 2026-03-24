import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BloodDropIcon } from '../../components/ui/BloodDropIcon'

export function TermsPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-dvh bg-[#36494f] px-3 pb-12 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            aria-label="Voltar"
            className="flex shrink-0 items-center justify-center rounded-full p-1 text-white hover:bg-white/20"
            type="button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <BloodDropIcon size={24} />
            <span className="text-sm tracking-[0.22em] text-white/90">GasoVet</span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/90 p-6 sm:p-8">
          <h1 className="mb-1 text-2xl font-bold text-[#36494f]">Termos de Uso</h1>
          <p className="mb-6 text-xs text-slate-400">Última atualização: março de 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-slate-700">

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">1. Sobre o GasoVet</h2>
              <p>
                O GasoVet é uma ferramenta de apoio clínico destinada exclusivamente a médicos-veterinários
                e profissionais habilitados da área veterinária. O aplicativo permite o cadastro de pacientes
                animais, o armazenamento de resultados de gasometria sanguínea e a extração automatizada de
                parâmetros a partir de laudos em PDF ou imagem, utilizando inteligência artificial.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">2. Público-alvo e requisitos de uso</h2>
              <p>
                O uso do GasoVet é restrito a médicos-veterinários graduados, residentes sob supervisão,
                ou técnicos autorizados em contexto clínico supervisionado. Ao criar uma conta, o usuário
                declara possuir habilitação técnica para interpretar resultados de gasometria e assume
                integral responsabilidade pelo uso das informações exibidas pelo aplicativo.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">3. Natureza da ferramenta — não substitui julgamento clínico</h2>
              <p className="mb-2">
                <strong>O GasoVet é uma ferramenta de apoio, não um sistema de diagnóstico.</strong> Todas
                as classificações ácido-base, cálculos de compensação, alertas de valores alterados e
                interpretações exibidas pelo aplicativo têm caráter exclusivamente informativo e educacional.
              </p>
              <p>
                Nenhuma decisão clínica — incluindo diagnóstico, prescrição, conduta terapêutica ou
                prognóstico — deve ser tomada com base exclusivamente nos resultados apresentados pelo
                GasoVet. O julgamento clínico do profissional habilitado, aliado à anamnese, exame físico
                e demais exames complementares, é sempre indispensável.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">4. Extração por inteligência artificial</h2>
              <p className="mb-2">
                O GasoVet utiliza modelos de inteligência artificial (Google Gemini) para extrair
                automaticamente valores numéricos de laudos enviados pelo usuário. Essa extração:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Pode conter erros, especialmente em laudos de baixa qualidade ou formatos não padronizados;</li>
                <li>Não constitui interpretação médica ou diagnóstico;</li>
                <li>Deve ser conferida pelo usuário antes de ser utilizada clinicamente;</li>
                <li>Está sujeita às limitações e disponibilidade do serviço de IA de terceiros.</li>
              </ul>
              <p className="mt-2">
                O usuário é inteiramente responsável por verificar a acurácia dos valores extraídos em
                relação ao laudo original.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">5. Valores de referência</h2>
              <p>
                Os valores de referência utilizados pelo aplicativo são baseados em literatura veterinária
                publicada e têm finalidade didática. Referências laboratoriais específicas de cada
                equipamento ou instituição podem diferir. O usuário deve considerar sempre os valores de
                referência fornecidos pelo laboratório responsável pelo exame.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">6. Armazenamento e privacidade de dados</h2>
              <p className="mb-2">
                O GasoVet armazena em servidores seguros (Supabase) os seguintes dados fornecidos pelo
                usuário:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Dados cadastrais do veterinário (nome, CRMV, estado, foto de perfil);</li>
                <li>Fichas de pacientes animais (nome, espécie, sexo, idade, peso, observações);</li>
                <li>Resultados de exames de gasometria e histórico de exames;</li>
                <li>Arquivos de laudos enviados (PDF e imagens).</li>
              </ul>
              <p className="mt-2">
                O acesso aos dados é protegido por autenticação individual e políticas de segurança em
                nível de linha (Row Level Security). Cada usuário acessa exclusivamente seus próprios dados.
                Os dados não são compartilhados com terceiros, exceto para processamento pela IA de
                extração de valores, conforme descrito na seção 4.
              </p>
              <p className="mt-2">
                O usuário é responsável por garantir que os dados inseridos no aplicativo estejam em
                conformidade com a legislação vigente de proteção de dados (LGPD) e com as normas do
                Conselho Federal de Medicina Veterinária (CFMV).
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">7. Responsabilidades do usuário</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>Manter suas credenciais de acesso em sigilo e não compartilhá-las;</li>
                <li>Inserir dados verídicos e verificar a acurácia das informações antes de utilizá-las;</li>
                <li>Utilizar o aplicativo apenas para finalidades clínicas e veterinárias legítimas;</li>
                <li>Não utilizar o aplicativo para fins que violem a ética profissional veterinária;</li>
                <li>Notificar imediatamente qualquer acesso não autorizado à sua conta.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">8. Limitação de responsabilidade</h2>
              <p>
                Os desenvolvedores do GasoVet não se responsabilizam por quaisquer danos diretos, indiretos
                ou consequentes decorrentes do uso ou da impossibilidade de uso do aplicativo, incluindo
                erros de extração de dados, indisponibilidade do serviço, decisões clínicas baseadas nas
                informações exibidas, ou perda de dados. O aplicativo é fornecido "no estado em que se
                encontra", sem garantias expressas ou implícitas de adequação a finalidade específica.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">9. Alterações nos Termos de Uso</h2>
              <p>
                Estes termos podem ser atualizados periodicamente. O uso continuado do aplicativo após
                alterações implica aceitação dos novos termos. Atualizações relevantes serão comunicadas
                aos usuários cadastrados.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">10. Contato</h2>
              <p>
                Dúvidas sobre estes termos ou sobre o uso do aplicativo podem ser enviadas pelo canal de
                suporte disponibilizado pelo GasoVet.
              </p>
            </section>

          </div>
        </div>

      </div>
    </main>
  )
}
