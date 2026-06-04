<?php
$data = [
    "available_perfumes" => [
        ["id" => 1, "name" => "Test", "rating" => 4.5, "olfactory_family" => "floral", "tenant_id" => 1]
    ],
    "features" => [1,0,0,0,0,0,0],
    "top_n" => 3
];
$ch = curl_init('http://127.0.0.1:8000/api/recommendations');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$r = curl_exec($ch);
if ($r === false) {
    echo 'curl_error: '.curl_error($ch);
} else {
    echo $r;
}
curl_close($ch);
