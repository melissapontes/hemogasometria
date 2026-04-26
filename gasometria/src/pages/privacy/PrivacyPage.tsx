import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BloodDropIcon } from '../../components/ui/BloodDropIcon'

export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-dvh bg-[#0f0f13] px-3 pb-12 pt-4 sm:px-6 sm:pt-6">
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
          <h1 className="mb-1 text-2xl font-bold text-[#36494f]">Política de Privacidade</h1>
          <p className="mb-6 text-xs text-slate-400">Última atualização: março de 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-slate-700">

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">1. Quem somos</h2>
              <p>
                O GasoVet é um aplicativo de apoio clínico veterinário para análise e armazenamento de
                resultados de gasometria sanguínea. Esta Política de Privacidade descreve como coletamos,
                usamos, armazenamos e protegemos os dados fornecidos pelos usuários, em conformidade com a
                Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">2. Dados que coletamos</h2>
              <p className="mb-2">Coletamos apenas os dados necessários para o funcionamento do aplicativo:</p>

              <p className="mb-1 font-medium text-[#4d4d4d]">Dados do veterinário (usuário):</p>
              <ul className="mb-3 ml-4 list-disc space-y-1">
                <li>Endereço de e-mail (usado para autenticação);</li>
                <li>Nome completo, número de CRMV e estado (informados voluntariamente no perfil);</li>
                <li>Data de nascimento (coletada no cadastro para verificação de maioridade);</li>
                <li>Foto de perfil (enviada voluntariamente).</li>
              </ul>

              <p className="mb-1 font-medium text-[#4d4d4d]">Dados dos pacientes animais:</p>
              <ul className="mb-3 ml-4 list-disc space-y-1">
                <li>Nome, espécie, sexo, idade e peso do animal;</li>
                <li>Observações clínicas inseridas pelo veterinário.</li>
              </ul>

              <p className="mb-1 font-medium text-[#4d4d4d]">Dados de exames:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Parâmetros de gasometria extraídos ou inseridos manualmente;</li>
                <li>Valores de referência laboratorial;</li>
                <li>Data do exame e tipo de amostra (venosa ou arterial);</li>
                <li>Arquivos de laudos enviados (PDF e imagens, máximo 10 MB por arquivo).</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">3. Como usamos os dados</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>Autenticar o acesso do usuário ao aplicativo;</li>
                <li>Exibir e organizar fichas de pacientes e histórico de exames;</li>
                <li>Processar arquivos de laudos para extração automatizada de valores (via IA);</li>
                <li>Calcular e exibir interpretações de apoio clínico;</li>
                <li>Personalizar o perfil do veterinário dentro do aplicativo.</li>
              </ul>
              <p className="mt-2">
                Não utilizamos os dados para fins comerciais, publicidade ou criação de perfis
                comportamentais.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">4. Compartilhamento de dados com terceiros</h2>
              <p className="mb-2">Os dados são compartilhados de forma limitada com:</p>

              <p className="mb-1 font-medium text-[#4d4d4d]">Supabase (infraestrutura de banco de dados e armazenamento):</p>
              <p className="mb-3">
                Todos os dados são armazenados em servidores da Supabase, que atua como operador de dados
                sob contrato de processamento. A Supabase não utiliza seus dados para fins próprios.
                Mais informações em{' '}
                <span className="font-medium">supabase.com/privacy</span>.
              </p>

              <p className="mb-1 font-medium text-[#4d4d4d]">Google Gemini (extração de dados por IA):</p>
              <p>
                Ao enviar um laudo para extração automática, o arquivo é transmitido à API do Google Gemini
                exclusivamente para identificação e extração de valores numéricos. O arquivo não é
                armazenado pelo Google após o processamento. Mais informações em{' '}
                <span className="font-medium">ai.google.dev/terms</span>.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">5. Segurança dos dados</h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>Autenticação por e-mail e senha com sessões seguras;</li>
                <li>Isolamento de dados por usuário via Row Level Security (RLS) — cada veterinário acessa apenas seus próprios dados;</li>
                <li>Transmissão de dados protegida por HTTPS/TLS;</li>
                <li>Arquivos de laudos armazenados em bucket privado, acessível apenas pelo próprio usuário;</li>
                <li>Fotos de perfil armazenadas em bucket público, sem associação de identidade pessoal.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">6. Retenção de dados</h2>
              <p>
                Os dados são mantidos enquanto a conta do usuário estiver ativa. Ao excluir um animal ou
                exame, os dados correspondentes são removidos permanentemente do banco de dados. Não
                realizamos backups independentes de dados individuais de usuários.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">7. Direitos do titular dos dados</h2>
              <p className="mb-2">
                Em conformidade com a LGPD, o usuário tem direito a:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Acesso:</strong> consultar quais dados estão armazenados sobre si;</li>
                <li><strong>Correção:</strong> atualizar dados incorretos ou desatualizados diretamente no aplicativo;</li>
                <li><strong>Exclusão:</strong> solicitar a remoção de seus dados e conta;</li>
                <li><strong>Portabilidade:</strong> solicitar exportação dos seus dados em formato estruturado;</li>
                <li><strong>Revogação do consentimento:</strong> encerrar o uso do aplicativo a qualquer momento.</li>
              </ul>
              <p className="mt-2">
                Para exercer esses direitos, entre em contato pelo canal de suporte do GasoVet.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">8. Restrição de idade e dados de menores</h2>
              <p className="mb-2">
                O GasoVet é destinado exclusivamente a profissionais com <strong>18 anos ou mais</strong>.
                Durante o cadastro, exigimos a data de nascimento do usuário para verificação de maioridade.
                Contas criadas com dados falsos de idade poderão ser encerradas sem aviso prévio.
              </p>
              <p>
                Não coletamos intencionalmente dados de menores de 18 anos. Se identificarmos que uma conta
                foi criada por menor de idade, os dados associados serão removidos. Os dados inseridos sobre
                animais (pacientes) não constituem dados pessoais de pessoas físicas e são tratados
                estritamente para a finalidade clínica veterinária descrita nesta política.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">9. Cookies e rastreamento</h2>
              <p>
                O GasoVet utiliza apenas os armazenamentos locais estritamente necessários para manter a
                sessão autenticada do usuário (localStorage). Não utilizamos cookies de rastreamento,
                analytics de terceiros ou tecnologias de rastreamento comportamental.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">10. Alterações nesta política</h2>
              <p>
                Esta Política de Privacidade pode ser atualizada periodicamente. Alterações relevantes
                serão comunicadas aos usuários cadastrados. O uso continuado do aplicativo após
                atualizações implica aceitação da nova versão da política.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-[#36494f]">11. Contato</h2>
              <p>
                Dúvidas, solicitações de acesso, correção ou exclusão de dados podem ser enviadas pelo
                canal de suporte disponibilizado pelo GasoVet.
              </p>
            </section>

          </div>
        </div>

      </div>
    </main>
  )
}
