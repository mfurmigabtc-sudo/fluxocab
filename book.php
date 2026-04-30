<?php
session_start();
require_once 'config.php';
if (!isset($_SESSION['user_id'])) { header("Location: index.php"); exit; }

if (!isset($_GET['id'])) { header("Location: index.php"); exit; }
$bookId = $_GET['id'];

// Save modifications
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_stages'])) {
    $stmt = $pdo->prepare("UPDATE book_stages SET status = ?, start_date = ?, end_date = ?, responsible = ? WHERE id = ? AND book_id = ?");
    
    foreach ($_POST['stages'] as $stageId => $data) {
        $stmt->execute([
            $data['status'],
            !empty($data['start_date']) ? $data['start_date'] : null,
            !empty($data['end_date']) ? $data['end_date'] : null,
            trim($data['responsible']),
            $stageId,
            $bookId
        ]);
    }
    $success_msg = "Modificações salvas com sucesso!";
}

// Fetch book
$stmt = $pdo->prepare("SELECT * FROM books WHERE id = ?");
$stmt->execute([$bookId]);
$book = $stmt->fetch();

if (!$book) { header("Location: index.php"); exit; }

// Fetch stages
$stmt = $pdo->prepare("SELECT * FROM book_stages WHERE book_id = ? ORDER BY id ASC");
$stmt->execute([$bookId]);
$stages = $stmt->fetchAll();

$tags = json_decode($book['tags'], true);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($book['title']); ?> - Editora CAB</title>
    <link rel="stylesheet" href="style.css">
    <script>
        function confirmDelete() {
            if(confirm('Tem certeza que deseja excluir este livro?')) {
                window.location.href = 'index.php?delete_book=<?php echo $book['id']; ?>';
            }
        }
    </script>
</head>
<body class="bg-gray">
    <header class="header">
         <div class="container flex-between">
            <div class="logo-area">
                <a href="index.php"><img src="logo_CAB.png" alt="Logo CAB" class="logo-small"></a>
                <h1>Editora CAB</h1>
            </div>
            <div class="user-area">
                <a href="index.php" class="text-blue">&larr; Voltar</a>
                <span class="user-name ml-2">👤 <?php echo htmlspecialchars($_SESSION['username']); ?></span>
            </div>
        </div>
    </header>

    <main class="container">
        <?php if(isset($success_msg)): ?>
            <div class="success mb-4"><?php echo $success_msg; ?></div>
        <?php endif; ?>

        <div class="flex-between mb-4">
            <a href="index.php" class="text-blue">&larr; Voltar para Coleção</a>
            <button onclick="confirmDelete()" class="btn btn-danger">Excluir Livro</button>
        </div>

        <div class="card mb-4 overflow-hidden">
            <div class="bg-dark p-4 text-white">
                <h2 style="margin:0 0 10px 0;"><?php echo htmlspecialchars($book['title']); ?></h2>
                <div class="text-muted">Por <?php echo htmlspecialchars($book['author']); ?></div>
            </div>
            <div class="grid-4 divide-x p-0">
                <div class="p-3">
                    <span class="text-xs text-muted">GÊNERO</span><br>
                    <strong><?php echo htmlspecialchars($book['genre']); ?></strong>
                </div>
                <div class="p-3">
                    <span class="text-xs text-muted">ANO</span><br>
                    <strong><?php echo $book['publication_year'] ?: '-'; ?></strong>
                </div>
                <div class="p-3">
                    <span class="text-xs text-muted">STATUS</span><br>
                    <strong><?php echo htmlspecialchars($book['condition_status']); ?></strong>
                </div>
                <div class="p-3">
                    <span class="text-xs text-muted">TAGS</span><br>
                    <?php if($tags && count($tags)>0): ?>
                        <?php foreach($tags as $tag): ?>
                            <span class="badge"><?php echo htmlspecialchars($tag); ?></span>
                        <?php endforeach; ?>
                    <?php else: ?> - <?php endif; ?>
                </div>
            </div>
            <?php if(!empty($book['notes'])): ?>
                <div class="p-3 bg-light border-top">
                    <span class="text-xs text-muted block mb-2">NOTAS</span>
                    <p style="margin:0; font-size:14px; white-space:pre-wrap;"><?php echo htmlspecialchars($book['notes']); ?></p>
                </div>
            <?php endif; ?>
        </div>

        <form method="POST">
            <div class="flex-between mb-4">
                <h2>Fluxo de Trabalho (Etapas)</h2>
                <button type="submit" name="save_stages" class="btn btn-primary">Salvar Modificações</button>
            </div>
            
            <div class="grid-4">
                <?php foreach($stages as $stage): 
                    $sid = $stage['id'];
                    $color = $stage['status'] == 'Concluído' ? 'bg-green' : ($stage['status'] == 'Em Andamento' ? 'bg-blue-light' : 'bg-light');
                ?>
                <div class="card stage-card">
                    <div class="stage-header flex-between <?php echo $color; ?>">
                        <span><?php echo htmlspecialchars($stage['stage_name']); ?></span>
                        <select name="stages[<?php echo $sid; ?>][status]" class="status-select">
                            <option value="Pendente" <?php if($stage['status']=='Pendente') echo 'selected'; ?>>Pendente</option>
                            <option value="Em Andamento" <?php if($stage['status']=='Em Andamento') echo 'selected'; ?>>Em Andamento</option>
                            <option value="Concluído" <?php if($stage['status']=='Concluído') echo 'selected'; ?>>Concluído</option>
                        </select>
                    </div>
                    <div class="stage-body">
                        <div class="form-group mb-2">
                            <input type="text" name="stages[<?php echo $sid; ?>][responsible]" placeholder="Responsável..." value="<?php echo htmlspecialchars($stage['responsible'] ?? ''); ?>" class="input-transparent">
                        </div>
                        <div class="grid-2">
                            <div>
                                <span class="text-xs">Início</span>
                                <input type="date" name="stages[<?php echo $sid; ?>][start_date]" value="<?php echo $stage['start_date']; ?>">
                            </div>
                            <div>
                                <span class="text-xs">Término</span>
                                <input type="date" name="stages[<?php echo $sid; ?>][end_date]" value="<?php echo $stage['end_date']; ?>">
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </form>
    </main>
</body>
</html>
