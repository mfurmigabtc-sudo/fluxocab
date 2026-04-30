# Como Publicar seu Aplicativo na HostGator (cPanel)

Seu aplicativo foi configurado para rodar perfeitamente em servidores Node.js tradicionais, incluindo a HostGator, que usa o painel de controle **cPanel**.

Siga os passos abaixo cuidadosamente:

## 1. Exportando os Arquivos
1. Aqui no Google AI Studio, vá nas configurações no canto superior (ícone de engrenagem) e escolha a opção para baixar/exportar os arquivos do projeto (você pode baixar o arquivo ZIP).
2. O arquivo ZIP já conterá tudo pronto. A pasta `/dist` conterá os arquivos de frontend e o arquivo `app.js` conterá todo o código do backend compilado e otimizado para o padrão da HostGator (Phusion Passenger).

## 2. Preparando os Arquivos para a HostGator
1. Extraia o ZIP em seu computador se precisar remover arquivos desnecessários.
2. Você precisará enviar apenas os seguintes arquivos para sua conta HostGator (através do Gerenciador de Arquivos do cPanel, ou via FTP):
   - A pasta `dist/` (inteira e todos os seus arquivos)
   - O arquivo `app.js`
   - O arquivo `package.json`
   - O arquivo `package-lock.json`
   
*(**Não** envie a pasta `node_modules` e nem os arquivos de código fonte originais como `src/` ou `vite.config.ts`, eles não são necessários para a versão de produção e só ocupariam espaço).*

## 3. Configurando a App Node.js no cPanel
1. Acesse seu painel administrativo da HostGator (cPanel).
2. Na seção **Software**, procure a opção **"Setup Node.js App"** (ou "Configurar App Node.js").
3. Clique no botão azul **"Create Application"** (Criar Aplicativo).
4. Preencha as configurações:
   - **Node.js version:** Selecione `18.x.x` ou `20.x.x` (o mais recente disponível).
   - **Application mode:** Escolha `Production`.
   - **Application root:** Crie uma pasta para sua aplicação (ex: `editora-app`).
   - **Application URL:** Escolha o subdomínio ou domínio onde o aplicativo ficará acessível (ex: `app.seudominio.com.br`).
   - **Application startup file:** Digite **`app.js`**.
5. Clique em **"Create"**.
6. IMPORTANTE: Depois que o aplicativo for criado, aparecerá uma seção na parte inferior chamada **"Environment variables"** (Variáveis de Ambiente). Adicione aqui as variáveis de conexão com o banco de dados que já criamos:
   - `DB_HOST` (o IP ou `localhost` caso o banco MySQL esteja na própria hospedagem). Como seu aplicativo agora roda DENTRO da Hostgator, aqui você pode usar `localhost`.
   - `DB_USER` (o nome do usuário do banco de dados).
   - `DB_PASSWORD` (a senha do banco de dados).
   - `DB_NAME` (o nome do banco de dados).

## 4. Enviando e Instalando Dependências
1. Agora, vá no **Gerenciador de Arquivos** do cPanel.
2. Navegue até a pasta root (a pasta que você escolheu como `Application root`, por ex: `editora-app`).
3. Faça upload dos arquivos que listamos no **passo 2** lá para dentro (`dist`, `app.js`, `package.json`, `package-lock.json`).
4. Volte para a tela do **Setup Node.js App**, na configuração do seu aplicativo.
5. Embaixo haverá uma seção informando o arquivo `package.json`. Clique no botão **"Run NPM Install"**. Aguarde o processo finalizar, isso vai instalar somente as bibliotecas necessárias de produção.
6. Após a instalação, role até o topo dessa mesma página e clique no botão **"Restart"** (Reiniciar) o aplicativo Node.js.

## OPÇÃO 2: Usar a versão em PHP Puro (Mais Fácil para HostGator)

Se você não quiser configurar um "App Node.js" no cPanel, criamos uma versão **PHP Puro + CSS** pronta para uso, localizada na pasta `versao_php/`.

1. Vá ao Gerenciador de Arquivos do cPanel.
2. Navegue até a pasta do seu domínio (geralmente `public_html`).
3. Faça o upload de **todos os arquivos** que estão na pasta `versao_php/` (`index.php`, `book.php`, `form.php`, `style.css` e `config.php`).
4. **IMPORTANTE**: Copie a imagem `logo_CAB.png` da pasta `public/` e coloque na mesma pasta dos arquivos PHP.
5. Edite o arquivo `config.php` na HostGator e preencha as credenciais do seu Banco de Dados MySQL:
   ```php
   $host = "localhost"; 
   $user = "seu_usuario_bd";
   $password = "sua_senha_bd";
   $dbname = "seu_nome_bd";
   ```
6. Acesse o seu site! Na tela de login, clique no link vermelho na parte inferior para criar as tabelas do banco automaticamente. Depois é só fazer login e usar.

## OPÇÃO 3: Deploy Automático via GitHub Actions (Avançado)

Se você hospedar o código deste projeto no **GitHub**, criamos rotinas automatizadas para que toda vez que você salvar (push) as modificações no GitHub, ele automaticamente invie a nova versão para sua conta HostGator por FTP.

**Como configurar:**
1. Envie seu código inicial para um repositório no GitHub.
2. No seu repositório no GitHub, vá em **Settings** > **Secrets and variables** > **Actions**.
3. Clique em **"New repository secret"** e crie 3 Segredos (exatamente com estes nomes em maiúsculo):
   - `FTP_SERVER`: Seu servidor FTP (ex: `ftp.seudominio.com.br` ou o IP do seu cPanel).
   - `FTP_USERNAME`: Seu usuário de FTP da HostGator.
   - `FTP_PASSWORD`: Sua senha de FTP da HostGator.

**Dois fluxos foram configurados:**
- Se você for usar a **Versão Node.js** (Opção 1): O arquivo está em `.github/workflows/deploy-node.yml`. Edite este arquivo e mude a linha `server-dir: ./` para a pasta onde você configurou o App Node.js no cPanel.
- Se você for usar a **Versão PHP** (Opção 2): O arquivo está em `.github/workflows/deploy-php.yml`. Ele vai pegar sua pasta `versao_php/` e jogar dentro de `public_html/`.

Após configurar os *Secrets* no Github, sempre que você mandar novidades para a nuvem no GitHub (na branch *main*), o servidor de deploy jogará os arquivos atualizados na sua HostGator automaticamente!
