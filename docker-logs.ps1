# docker-logs.ps1
param(
    [string]$service = ""
)

if ($service) {
    docker-compose logs -f $service
} else {
    docker-compose logs -f
}