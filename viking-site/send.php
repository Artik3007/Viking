<?php
/* Обработчик формы «Оставить заявку на исследование».
   Отправляет заявку письмом на адрес из $to. Нужен хостинг с PHP и настроенной функцией mail()
   (на большинстве российских хостингов она работает сразу). */

$to = 'info@viking-lab.ru';

header('Content-Type: application/json; charset=utf-8');

function answer($ok, $code = 200) {
    http_response_code($code);
    echo json_encode(array('ok' => $ok), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') answer(false, 405);

// Скрытое поле-ловушка: его заполняют только спам-боты
if (!empty($_POST['website'])) answer(true);

function field($name, $max) {
    $v = isset($_POST[$name]) ? trim((string)$_POST[$name]) : '';
    $v = str_replace(array("\r", "\0"), '', $v);
    return mb_substr($v, 0, $max, 'UTF-8');
}

$name    = field('name', 200);
$phone   = field('phone', 60);
$message = field('message', 5000);
$page    = field('page', 300);
$agree   = !empty($_POST['agree']);

if ($name === '' || $phone === '' || $message === '' || !$agree) answer(false, 422);
if (!preg_match('/\d{5,}/', preg_replace('/\D/', '', $phone))) answer(false, 422);

$host = preg_replace('/[^a-z0-9.\-]/i', '', isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost');
$host = preg_replace('/^www\./i', '', $host);

$subject = '=?UTF-8?B?' . base64_encode('Заявка на исследование с сайта') . '?=';
$body = "Новая заявка с сайта лаборатории «ВИКИНГ»\n\n"
      . "Имя: $name\n"
      . "Телефон: $phone\n\n"
      . "Описание задачи:\n$message\n\n"
      . "Страница: $page\n"
      . 'Дата: ' . date('d.m.Y H:i') . "\n";

$headers = "MIME-Version: 1.0\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n"
         . "Content-Transfer-Encoding: 8bit\r\n"
         . "From: =?UTF-8?B?" . base64_encode('Сайт ВИКИНГ') . "?= <noreply@$host>\r\n";

answer(@mail($to, $subject, $body, $headers) ? true : false, 200);
