# Auditoria Renovar BR (somente leitura)

**Como foi verificado:** li o código dos arquivos e rodei os testes que já existem (todos passaram). Desta vez **não abri o site** no navegador: nada foi testado clicando de verdade. Nada foi alterado, nem no banco nem nos acessos.

## 1. Página inicial — as 4 mudanças estão no código
- **Obra repetida resolvida:** existe só um carrossel, que mostra as obras cadastradas. A obra não está mais escrita direto na página. O contador de entrega fica em cada card e o das férias fica abaixo do carrossel.
- **Foto do responsável:** não aparece em nenhuma tela. Sobrou só o registro do arquivo, sem uso.
- **"Já sou cliente":** leva às obras com rolagem suave. Itajaí aparece na lista de cidades, no texto do topo, na descrição para o Google, no rodapé e no PDF.
- **Pesquisa:** busca nas obras publicadas de verdade, por nome, cidade e endereço, sem diferenciar acentos. As obras em andamento aparecem primeiro e não há repetição.

## 2. Área administrativa
- **Criar:** o botão "Novo empreendimento" cria a obra e abre a ficha.
- **Editar:** o botão Salvar grava todos os dados.
- **Excluir:** pede confirmação e apaga as fotos e o cadastro.
- **Mostrar ou tirar do site:** dá para fazer pelo card da obra ou pela opção na ficha.
- **Acesso:** a área só abre com login, e só o administrador consegue ler ou gravar os cadastros.

## 3. Ficha técnica
- **Blocos:** cliente, empreendimento, mão de obra, materiais, equipamentos, outros custos, prazos e condições, e card do site.
- **Resumo:** um painel mostra o custo total, o lucro oculto, os impostos, o preço final e o preço por m².
- **Problema no celular:** nas listas de mão de obra, materiais e equipamentos, os títulos das colunas (Unidade, Quantidade, Valor por unidade, Dias) somem. Ficam caixas sem nome, e não dá para saber qual é a quantidade e qual é o preço.

## 4. Fotos
- **Proteção:** as fotos ficam guardadas em área privada. Quem visita o site só vê fotos de obras publicadas, por links que expiram em 1 hora. Os dados do cliente e os valores nunca vão para a página pública.
- **Risco 1:** remover uma foto apaga o arquivo na hora, antes de salvar. Se você sair sem salvar, o cadastro continua apontando para uma foto que não existe mais, e o site mostra um espaço vazio.
- **Risco 2:** se você enviar uma foto e sair sem salvar, o arquivo fica guardado sem uso.
- **Avisos:** não há aviso quando a foto passa de 10 MB, nem quando a exclusão da obra falha.

## 5. Orçamento em PDF
- **Cálculo:**
  - custo = mão de obra + materiais + equipamentos + outros;
  - preço antes dos impostos = custo × (1 + lucro%);
  - preço com impostos = preço antes dos impostos ÷ (1 − impostos%);
  - total = preço com impostos − desconto.
- **Valores das linhas:** o lucro e os impostos ficam embutidos proporcionalmente em cada linha, e o lucro não aparece para o cliente.
- **Como sai o PDF:** pela janela de impressão do navegador ("Salvar como PDF"). Não foi testado na prática.
- **Pontos de atenção:**
  - o desconto é tirado depois dos impostos, então o valor de impostos mostrado na ficha não diminui com o desconto;
  - a soma das linhas pode diferir do total em alguns centavos, por causa do arredondamento.

## 6. Testes e falhas prováveis
- **Testes que existem:** cálculo do orçamento, pesquisa e cidades, e endereços do site. Todos passaram.
- **Sem teste:** login, salvar a ficha, fotos e PDF.
- **Prazo:** a entrega de 20/10/2026 é amanhã. Depois disso, o card mostra "Prazo de entrega atingido" até a data ser alterada no cadastro.

## Correções sugeridas, por prioridade (menor mudança)
1. Remoção de fotos: só apagar o arquivo depois de Salvar, ou salvar a ficha logo após enviar ou remover uma foto (1 arquivo).
2. Celular: mostrar o nome de cada campo nas listas de mão de obra, materiais e equipamentos (1 arquivo).
3. Mostrar uma mensagem de erro quando a exclusão falhar, e avisar quando a foto passar de 10 MB (1 arquivo).
4. Opcional: deixar explícito na ficha que o desconto é aplicado depois dos impostos, e acertar os centavos na última linha do PDF.
5. Opcional: apagar o registro da foto do responsável que não é usado.

Nenhuma delas muda o banco, os acessos ou as fórmulas.

## GitHub
Eu não consigo ver se o GitHub está conectado. Confira em Configurações do projeto → Git.
