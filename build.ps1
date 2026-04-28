<#
.SYNOPSIS
    Build script for seo-planner (Windows PowerShell).
.DESCRIPTION
    Mirrors the Makefile targets: build, build-combined, package, package-combined,
    package-tar, validate, lint, test, clean, all.
.PARAMETER Target
    The build target to run. Defaults to "all".
.EXAMPLE
    .\build.ps1 build
    .\build.ps1 package
    .\build.ps1 validate
    .\build.ps1 clean
#>
param(
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

$Version    = (Get-Content -Path "VERSION" -Raw).Trim()
$BuildDir   = "build"
$DistDir    = "dist"
$PackageDir = Join-Path $BuildDir "seo-planner"
$CombinedFile = Join-Path $BuildDir "seo-planner-combined.md"

$RequiredFiles = @(
    "src/SKILL.md",
    "src/scripts/bootstrap.mjs",
    "src/references/file-formats.md",
    "src/references/technical-seo.md",
    "src/references/content-strategy.md",
    "src/references/backlink-strategy.md",
    "src/references/on-page-seo.md",
    "src/references/scoring-framework.md",
    "src/references/competitive-intelligence.md",
    "src/agents/orchestrator.md",
    "src/agents/seo-auditor.md",
    "src/agents/seo-strategist.md",
    "src/agents/seo-planner-agent.md",
    "src/agents/seo-executor.md",
    "src/agents/seo-measurer.md",
    "src/agents/seo-reviewer.md",
    "src/agents/seo-archivist.md"
)

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

function Invoke-Build {
    Write-Host "==> Building seo-planner v$Version..."
    if (Test-Path $PackageDir) { Remove-Item -Recurse -Force $PackageDir }
    New-Item -ItemType Directory -Path $PackageDir -Force | Out-Null
    Copy-Item -Recurse -Path "src/*" -Destination $PackageDir
    Copy-Item -Path "VERSION" -Destination $PackageDir
    foreach ($extra in @("README.md", "LICENSE", "CHANGELOG.md")) {
        if (Test-Path $extra) { Copy-Item -Path $extra -Destination $PackageDir }
    }
    Write-Host "==> Build complete: $PackageDir/"
}

function Invoke-BuildCombined {
    Invoke-Build
    Write-Host "==> Generating combined file..."
    Copy-Item -Path "src/SKILL.md" -Destination $CombinedFile

    $refs = Get-ChildItem -Path "src/references" -Filter "*.md" | Sort-Object Name
    foreach ($ref in $refs) {
        $separator = "`n---`n`n<!-- Inlined from $($ref.FullName) -->`n"
        Add-Content -Path $CombinedFile -Value $separator
        Get-Content -Path $ref.FullName -Raw | Add-Content -Path $CombinedFile
    }
    Write-Host "==> Combined file: $CombinedFile"
}

function Invoke-Package {
    Invoke-Build
    Write-Host "==> Packaging seo-planner v$Version as zip..."
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
    $zipPath = Join-Path $DistDir "seo-planner-v$Version.zip"
    if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
    Compress-Archive -Path $PackageDir -DestinationPath $zipPath
    Write-Host "==> Package: $zipPath"
}

function Invoke-PackageCombined {
    Invoke-BuildCombined
    Write-Host "==> Copying combined file to dist..."
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
    $destPath = Join-Path $DistDir "seo-planner-v$Version-combined.md"
    Copy-Item -Path $CombinedFile -Destination $destPath
    Write-Host "==> Package: $destPath"
}

function Invoke-PackageTar {
    Invoke-Build
    Write-Host "==> Packaging seo-planner v$Version as tar.gz..."
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
    $tarPath = Join-Path $DistDir "seo-planner-v$Version.tar.gz"
    # Requires PowerShell 7+ or tar available on PATH (Windows 10 1803+)
    tar -czf $tarPath -C $BuildDir "seo-planner"
    Write-Host "==> Package: $tarPath"
}

function Invoke-Validate {
    Write-Host "==> Validating project structure..."
    $errors = 0

    foreach ($f in $RequiredFiles) {
        if (-not (Test-Path $f)) {
            Write-Host "  MISSING: $f"
            $errors++
        }
    }

    Write-Host "==> Checking cross-references in SKILL.md..."
    $skillContent = Get-Content -Path "src/SKILL.md" -Raw
    $refs = [regex]::Matches($skillContent, 'references/[a-z0-9_-]+\.md') |
        ForEach-Object { $_.Value } | Sort-Object -Unique
    foreach ($ref in $refs) {
        $refPath = Join-Path "src" $ref
        if (-not (Test-Path $refPath)) {
            Write-Host "  BROKEN REF: $refPath (referenced in SKILL.md)"
            $errors++
        }
    }

    Write-Host "==> Checking agent frontmatter..."
    $agentFiles = Get-ChildItem -Path "src/agents" -Filter "*.md"
    $requiredFields = @("name", "description", "tools", "model")
    foreach ($agent in $agentFiles) {
        $content = Get-Content -Path $agent.FullName -Raw
        foreach ($field in $requiredFields) {
            if ($content -notmatch "(?m)^${field}:") {
                Write-Host "  MISSING FIELD: $field in $($agent.FullName)"
                $errors++
            }
        }
    }

    if ($errors -gt 0) {
        Write-Host "==> Validation FAILED ($errors errors)"
        exit 1
    } else {
        Write-Host "==> Validation passed"
    }
}

function Invoke-Lint {
    Write-Host "==> Syntax-checking .mjs files..."
    $errors = 0
    $mjsFiles = Get-ChildItem -Path "src/scripts" -Filter "*.mjs" -Recurse

    foreach ($f in $mjsFiles) {
        $result = & node --check $f.FullName 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  SYNTAX ERROR: $($f.FullName)"
            $errors++
        } else {
            Write-Host "  OK: $($f.FullName)"
        }
    }

    if ($errors -gt 0) {
        Write-Host "==> Lint FAILED ($errors errors)"
        exit 1
    } else {
        Write-Host "==> Lint passed"
    }
}

function Invoke-Test {
    Write-Host "==> Running tests..."
    & node --test "src/scripts/bootstrap.test.mjs"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "==> Tests FAILED"
        exit 1
    }
    Write-Host "==> Tests passed"
}

function Invoke-Clean {
    Write-Host "==> Cleaning build artifacts..."
    if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
    if (Test-Path $DistDir)  { Remove-Item -Recurse -Force $DistDir }
    Write-Host "==> Clean complete"
}

function Invoke-All {
    Invoke-Build
    Invoke-Validate
    Invoke-Test
    Write-Host "==> All targets complete (v$Version)"
}

# ---------------------------------------------------------------------------
# Target dispatch
# ---------------------------------------------------------------------------

switch ($Target.ToLower()) {
    "build"            { Invoke-Build }
    "build-combined"   { Invoke-BuildCombined }
    "package"          { Invoke-Package }
    "package-combined" { Invoke-PackageCombined }
    "package-tar"      { Invoke-PackageTar }
    "validate"         { Invoke-Validate }
    "lint"             { Invoke-Lint }
    "test"             { Invoke-Test }
    "clean"            { Invoke-Clean }
    "all"              { Invoke-All }
    default {
        Write-Host "Unknown target: $Target"
        Write-Host "Available targets: build, build-combined, package, package-combined, package-tar, validate, lint, test, clean, all"
        exit 1
    }
}
