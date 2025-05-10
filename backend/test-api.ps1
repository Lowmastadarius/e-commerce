# Test de la route de test
Write-Host "Test de la route /api/test..."
$testResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method Get
Write-Host "Réponse de /api/test: $($testResponse | ConvertTo-Json)"

# Test de l'inscription
Write-Host "`nTest de l'inscription..."
$registerData = @{
    fullName = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "Réponse de l'inscription: $($registerResponse | ConvertTo-Json)"
} catch {
    Write-Host "Erreur lors de l'inscription: $_"
}

# Test de la connexion
Write-Host "`nTest de la connexion..."
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "Réponse de la connexion: $($loginResponse | ConvertTo-Json)"
} catch {
    Write-Host "Erreur lors de la connexion: $_"
}

# Stocker le token pour le test de déconnexion
$token = $loginResponse.token

# Test de déconnexion
Write-Host "`nTest de déconnexion..."
$logoutResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/logout" -Method Post -Headers @{Authorization="Bearer $token"} -ContentType "application/json"
Write-Host "Réponse de déconnexion:"
$logoutResponse | ConvertTo-Json 