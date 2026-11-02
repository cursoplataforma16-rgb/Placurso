# Placurso — Interface de aprendizagem guiada e tranquila

**Data:** 2026-11-02  
**Estado:** Direcção de experiência aprovada pelo CEO através do pedido de simplificação integral da interface.

## Objectivo

Ajudar uma pessoa que chega ao Placurso, especialmente pelo telemóvel, a perceber rapidamente o que pode aprender, escolher uma área e iniciar um percurso sem ter de interpretar muitos blocos, formulários ou opções ao mesmo tempo.

O primeiro ecrã deve responder a uma pergunta: **“O que gostarias de aprender?”**

## Público e contexto

- Visitantes novos, alunos e pessoas que ainda não sabem exactamente que curso procurar.
- Utilização prioritária em telemóveis, com diferentes tamanhos de ecrã e níveis de literacia digital.
- Português simples, mensagens curtas e escolhas com nomes familiares.

## Princípios de experiência

1. **Uma decisão principal por momento.** Não competir com vários botões de igual importância.
2. **Escolha visual antes de formulário.** Áreas de aprendizagem devem ser cartões/botões acessíveis, não uma lista longa num select.
3. **Revelação progressiva.** Mostrar quatro áreas principais; as outras opções só aparecem quando a pessoa pede “Ver todas as áreas”.
4. **Formulário leve.** Manter apenas faixa etária, área e objectivo como dados necessários ao percurso. Local de nascimento, telefone e horas semanais ficam em opções facultativas recolhidas.
5. **Hierarquia calma.** Fundo claro, contraste confortável, texto legível, largura de leitura controlada, espaçamento consistente e sem movimento desnecessário.
6. **Acções tocáveis e acessíveis.** Alvos de toque com pelo menos 44 px, estados visíveis de foco/seleccionado, labels e regiões com anúncio de estado.
7. **A pessoa pode mudar a escolha.** A escolha de área não deve parecer irreversível nem forçar uma inscrição.
8. **Sem dark patterns.** Não prometer viralização, emprego, rendimento, certificados ou resultados não confirmados.

## Estrutura proposta

### Entrada pública

- Cabeçalho reduzido a marca e acesso Google.
- Hero com uma frase curta, uma explicação curta e uma única acção principal.
- Secção de escolha com quatro áreas mais comuns:
  - Tecnologia
  - Marketing e publicidade
  - Educação
  - Ensino bíblico
- “Ver todas as áreas” abre as opções restantes: Agronomia, Engenharia ambiental, Telecomunicações, Gestão e negócios, Outra área.
- A escolha destaca o cartão, guarda o valor no código já aceite pela aplicação e apresenta o próximo passo.

### Área de aprendizagem

- Manter o painel existente, Supabase e função annan-ensino.
- A pessoa só vê o formulário depois de escolher uma área e iniciar a aprendizagem.
- Faixa etária, área e objectivo continuam a alimentar os campos existentes e a operação perfil_rapido.
- Local de nascimento, telefone e disponibilidade semanal permanecem opcionais e recolhidos em “Mais opções (facultativo)”.
- Preservar os IDs e o contrato actual do formulário sempre que possível.

### Conteúdos secundários

- Catálogo continua a mostrar apenas cursos publicados.
- Centro de desafios mantém o mesmo motor ANNAN, mas fica dentro de uma secção recolhida por defeito; é aberto por quem quer experimentar.
- Manter /ceo, a sua página, o login Google e o centro de integrações sem alterações.

## Limites técnicos e de segurança

- Não introduzir framework, biblioteca ou dependência nova.
- Não alterar annan-ensino, a função de crescimento, tabelas Supabase, RLS, sessão ou OAuth.
- Não alterar o painel CEO nem os redireccionamentos de /cursos.
- Não guardar tokens de sessão nem dados sensíveis novos no browser. A escolha temporária de área pode usar estado de página/sessionStorage apenas para sobreviver ao OAuth existente.
- Não mexer na versão de produção nem fazer merge/publicação nesta tarefa.
- Manter a separação total entre Placurso e DIONUEL/Kunica.

## Critérios de aceitação

- Um visitante identifica a acção principal sem ler um bloco grande de texto.
- As quatro áreas principais estão visíveis e as restantes estão recolhidas por defeito.
- Seleccionar uma área destaca-a, preenche o valor existente do campo interest e revela um próximo passo inequívoco.
- O formulário visível não apresenta de início campos opcionais de telefone, local de nascimento ou horas por semana.
- O Centro de Desafios não compete visualmente com a escolha de percurso no primeiro ecrã.
- Todos os caminhos continuam a usar o mesmo ANNAN e os contratos existentes.
- Build completo, verificações de isolamento, teste do login CEO e verificações actuais passam.
- A página funciona em ecrãs estreitos, teclado e leitores de ecrã, respeitando prefers-reduced-motion.
