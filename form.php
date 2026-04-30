<?php
session_start();
if (!isset($_SESSION['user_id'])) { header("Location: index.php"); exit; }
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Novo Livro - Editora CAB</title>
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
                <a href="index.php" class="text-blue">&larr; Voltar</a>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="card p-4">
            <h2 class="mb-4">Adicionar Novo Livro</h2>
            <form action="index.php" method="POST">
                <div class="grid-2">
                    <div class="form-group">
                        <label>Título</label>
                        <input type="text" name="title" required>
                    </div>
                    <div class="form-group">
                        <label>Autor</label>
                        <input type="text" name="author" required>
                    </div>
                    <div class="form-group">
                        <label>Gênero/Coleção</label>
                        <input type="text" name="genre" value="Educação Financeira">
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Ano</label>
                            <input type="number" name="publication_year">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select name="condition_status">
                                <option value="Em Planejamento">Em Planejamento</option>
                                <option value="Em Produção">Em Produção</option>
                                <option value="Publicado">Publicado</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Tags (separadas por vírgula)</label>
                        <input type="text" name="tags">
                    </div>
                    <div class="form-group full-width">
                        <label>Notas</label>
                        <textarea name="notes" rows="3"></textarea>
                    </div>
                </div>
                <div class="flex-end mt-4">
                    <a href="index.php" class="btn btn-secondary mr-2">Cancelar</a>
                    <button type="submit" name="add_book" class="btn btn-primary">Salvar Livro</button>
                </div>
            </form>
        </div>
    </main>
</body>
</html>
