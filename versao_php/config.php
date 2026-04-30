<?php
// Configurações do Banco de Dados
$host = "localhost"; // Ou o IP do MySQL da Hostgator
$user = "SEU_USUARIO_AQUI";
$password = "SUA_SENHA_AQUI";
$dbname = "SEU_BANCO_AQUI";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Erro de conexão (Edite o config.php): " . $e->getMessage());
}
?>
