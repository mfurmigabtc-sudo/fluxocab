<?php
session_start();
require_once 'config.php';

// Login handling
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
    $stmt->execute([$_POST['username'], $_POST['password']]);
    $user = $stmt->fetch();
    
    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        header("Location: index.php");
        exit;
    } else {
        $login_error = "Credenciais inválidas.";
    }
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: index.php");
    exit;
}

// Initialization of DB if needed (Optional helper)
if (isset($_GET['init_db'])) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS books (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          genre VARCHAR(100),
          publication_year INT,
          condition_status VARCHAR(50),
          tags JSON,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS book_stages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          book_id INT NOT NULL,
          stage_name VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'Pendente',
          start_date DATE,
          end_date DATE,
          responsible VARCHAR(100),
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        INSERT IGNORE INTO users (username, password) VALUES ('admin', 'admin123');
    ");
    $db_message = "Tabelas criadas com sucesso! Faça login com admin / admin123";
}

// Show Login Page if not logged in
if (!isset($_SESSION['user_id'])) {
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Login - Editora CAB</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gray">
    <div class="login-container">
        <div class="login-box">
            <div class="logo-container">
                <img src="logo_CAB.png" alt="Logo CAB" class="logo">
            </div>
            <h2>Editora CAB</h2>
            <p>Acesse o sistema de fluxo</p>
            
            <?php if(isset($login_error)) echo "<div class='error'>$login_error</div>"; ?>
            <?php if(isset($db_message)) echo "<div class='success'>$db_message</div>"; ?>

            <form method="POST">
                <div class="form-group">
                    <label>Usuário</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit" name="login" class="btn btn-primary btn-block">Entrar</button>
            </form>
            <div style="margin-top: 15px; font-size: 12px; color: #666; text-align: center;">
                <p>O usuário padrão é <strong>admin</strong> e a senha <strong>admin123</strong>.</p>
                <a href="?init_db=1" style="color:red;">Clique aqui caso precise inicializar o banco de dados pela 1ª vez.</a>
            </div>
        </div>
    </div>
</body>
</html>
<?php exit; } ?>

<?php
// CRUD Actions for Logged in User

// Create Book
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_book'])) {
    $tagsRaw = !empty($_POST['tags']) ? explode(',', str_replace(', ', ',', trim($_POST['tags']))) : [];
    $tagsJson = json_encode($tagsRaw);
    
    $stmt = $pdo->prepare("INSERT INTO books (title, author, genre, publication_year, condition_status, tags, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $_POST['title'], $_POST['author'], $_POST['genre'], 
        $_POST['publication_year'] ?: null, $_POST['condition_status'], 
        $tagsJson, $_POST['notes']
    ]);
    
    $bookId = $pdo->lastInsertId();
    $defaultStages = [
        "Manuscrito", "Layout", "Projeto Gráfico", "Ilustrações", 
        "Diagramação", "Revisão", "Análise Técnica", "Impressão", "Manual do professor"
    ];
    $stmtStage = $pdo->prepare("INSERT INTO book_stages (book_id, stage_name, status) VALUES (?, ?, 'Pendente')");
    foreach ($defaultStages as $stage) {
        $stmtStage->execute([$bookId, $stage]);
    }
    header("Location: index.php");
    exit;
}

// Delete Book
if (isset($_GET['delete_book'])) {
    $stmt = $pdo->prepare("DELETE FROM books WHERE id = ?");
    $stmt->execute([$_GET['delete_book']]);
    header("Location: index.php");
    exit;
}

// Get all books
$books = $pdo->query("SELECT * FROM books ORDER BY created_at DESC")->fetchAll();
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Editora CAB</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gray">
    <header class="header">
        <div class="container flex-between">
            <div class="logo-area">
                <a href="index.php"><img src="logo_CAB.png" alt="Logo CAB" class="logo-small"></a>
                <h1>Editora CAB</h1>
            </div>
            <div class="user-area">
                <span>👤 <?php echo htmlspecialchars($_SESSION['username']); ?></span>
                <a href="?logout=1" class="text-red">Sair</a>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="flex-between header-title">
            <div>
                <h2>Coleção de Livros</h2>
                <p>Gerencie o fluxo de trabalho editorial.</p>
            </div>
            <a href="form.php" class="btn btn-primary">+ Novo Livro</a>
        </div>

        <div class="grid">
            <?php foreach ($books as $book): 
                $tags = json_decode($book['tags'], true);    
            ?>
            <a href="book.php?id=<?php echo $book['id']; ?>" class="card book-card">
                <div class="flex-between">
                    <span class="badge"><?php echo htmlspecialchars($book['genre']); ?></span>
                    <span class="text-muted">#<?php echo $book['id']; ?></span>
                </div>
                <h3><?php echo htmlspecialchars($book['title']); ?></h3>
                <p class="text-muted mb-4">Por <?php echo htmlspecialchars($book['author']); ?></p>
                <div class="flex-between border-top pt-2">
                    <span class="bg-light px-2 py-1 rounded">Ano: <?php echo $book['publication_year'] ?: '-'; ?></span>
                    <span class="text-blue font-medium">Acessar &rarr;</span>
                </div>
            </a>
            <?php endforeach; ?>
            <?php if(empty($books)): ?>
                <div class="empty-state">Nenhum livro catalogado. Clique em "Novo Livro".</div>
            <?php endif; ?>
        </div>
    </main>
</body>
</html>
