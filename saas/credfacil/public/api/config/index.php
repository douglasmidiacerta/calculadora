<?php
/**
 * API de Configurações em PHP para cPanel (Hospedagem Compartilhada)
 * Simulador de Vendas e Taxas - Permite salvar e carregar taxas e opções no servidor
 */

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Permite requisições de origens diferentes em desenvolvimento local
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$config_file = __DIR__ . '/config.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($config_file)) {
        $content = file_get_contents($config_file);
        if ($content !== false) {
            echo $content;
            exit;
        }
    }
    // Se o arquivo não existir, retorna um objeto vazio de sucesso
    echo json_encode(new stdClass());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'JSON inválido']);
        exit;
    }

    // Salva as configurações recebidas no arquivo local
    $saved = file_put_contents($config_file, json_encode($data, JSON_PRETTY_PRINT));

    if ($saved !== false) {
        echo json_encode(['success' => true, 'message' => 'Configurações salvas com sucesso']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Falha ao salvar configurações no servidor']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método não permitido']);
exit;
