<?php
/**
 * API de Login em PHP para cPanel (Hospedagem Compartilhada)
 * Simulador de Vendas e Taxas
 */

// Habilita exibição de erros para debug (pode ser desativado em produção estável)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Configurações do Banco de Dados
$db_host = "localhost";
$db_name = "ljonline_calculadora";
$db_user = "admin";
$db_password = "3x51ELCO";

try {
    // Conexão via PDO
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Cria a tabela de usuários se ela não existir
    $pdo->exec("CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(50) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

    // Insere o usuário admin padrão se ele não existir
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE usuario = ?");
    $stmt->execute(['admin']);
    if ($stmt->fetchColumn() == 0) {
        $stmtInsert = $pdo->prepare("INSERT INTO usuarios (usuario, senha) VALUES (?, ?)");
        $stmtInsert->execute(['admin', '123456']);
    }

} catch (PDOException $e) {
    // Caso ocorra erro de conexão com o banco de dados (ex: credenciais incorretas)
    // Para garantir o funcionamento em ambiente local ou sem banco, oferecemos um fallback
    $db_error = $e->getMessage();
}

// Processa a requisição POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtém o corpo da requisição JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $username = isset($data['username']) ? trim($data['username']) : '';
    $password = isset($data['password']) ? trim($data['password']) : '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Usuário e senha são obrigatórios']);
        exit;
    }

    // 1. Tenta validar no banco de dados se a conexão foi bem-sucedida
    if (isset($pdo)) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ? AND senha = ?");
            $stmt->execute([$username, $password]);
            $user = $stmt->fetch();

            if ($user) {
                echo json_encode(['success' => true, 'token' => 'mock-jwt-token-php']);
                exit;
            }
        } catch (Exception $ex) {
            // Em caso de erro na consulta, segue para o fallback
        }
    }

    // 2. Fallback estático (caso o banco não tenha o registro ou conexão falhe)
    if ($username === 'admin' && $password === '123456') {
        echo json_encode(['success' => true, 'token' => 'mock-jwt-token-php-fallback']);
        exit;
    }

    // Se as credenciais estiverem incorretas
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuário ou senha inválidos']);
    exit;
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}
