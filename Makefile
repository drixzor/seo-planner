# seo-planner Makefile
# Compatible with macOS and Linux

VERSION := $(shell cat VERSION)
BUILD_DIR := build
DIST_DIR := dist
PACKAGE_DIR := $(BUILD_DIR)/seo-planner
COMBINED_FILE := $(BUILD_DIR)/seo-planner-combined.md

# Required files for validation
REQUIRED_FILES := \
	src/SKILL.md \
	src/scripts/bootstrap.mjs \
	src/references/file-formats.md \
	src/references/technical-seo.md \
	src/references/content-strategy.md \
	src/references/backlink-strategy.md \
	src/references/on-page-seo.md \
	src/references/scoring-framework.md \
	src/references/competitive-intelligence.md \
	src/agents/orchestrator.md \
	src/agents/seo-auditor.md \
	src/agents/seo-strategist.md \
	src/agents/seo-planner-agent.md \
	src/agents/seo-executor.md \
	src/agents/seo-measurer.md \
	src/agents/seo-reviewer.md \
	src/agents/seo-archivist.md

AGENT_FILES := $(wildcard src/agents/*.md)
MJS_FILES := $(wildcard src/scripts/*.mjs)
REFERENCE_FILES := $(wildcard src/references/*.md)

.PHONY: all build build-combined package package-combined package-tar validate lint test clean

all: build validate test
	@echo "==> All targets complete (v$(VERSION))"

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

build:
	@echo "==> Building seo-planner v$(VERSION)..."
	@rm -rf $(PACKAGE_DIR)
	@mkdir -p $(PACKAGE_DIR)
	@cp -R src/ $(PACKAGE_DIR)/
	@cp VERSION $(PACKAGE_DIR)/
	@cp README.md $(PACKAGE_DIR)/ 2>/dev/null || true
	@cp LICENSE $(PACKAGE_DIR)/ 2>/dev/null || true
	@cp CHANGELOG.md $(PACKAGE_DIR)/ 2>/dev/null || true
	@echo "==> Build complete: $(PACKAGE_DIR)/"

build-combined: build
	@echo "==> Generating combined file..."
	@cp src/SKILL.md $(COMBINED_FILE)
	@for ref in $(REFERENCE_FILES); do \
		echo "" >> $(COMBINED_FILE); \
		echo "---" >> $(COMBINED_FILE); \
		echo "" >> $(COMBINED_FILE); \
		echo "<!-- Inlined from $$ref -->" >> $(COMBINED_FILE); \
		echo "" >> $(COMBINED_FILE); \
		cat "$$ref" >> $(COMBINED_FILE); \
	done
	@echo "==> Combined file: $(COMBINED_FILE)"

# ---------------------------------------------------------------------------
# Package
# ---------------------------------------------------------------------------

package: build
	@echo "==> Packaging seo-planner v$(VERSION) as zip..."
	@mkdir -p $(DIST_DIR)
	@cd $(BUILD_DIR) && zip -rq ../$(DIST_DIR)/seo-planner-v$(VERSION).zip seo-planner/
	@echo "==> Package: $(DIST_DIR)/seo-planner-v$(VERSION).zip"

package-combined: build-combined
	@echo "==> Copying combined file to dist..."
	@mkdir -p $(DIST_DIR)
	@cp $(COMBINED_FILE) $(DIST_DIR)/seo-planner-v$(VERSION)-combined.md
	@echo "==> Package: $(DIST_DIR)/seo-planner-v$(VERSION)-combined.md"

package-tar: build
	@echo "==> Packaging seo-planner v$(VERSION) as tar.gz..."
	@mkdir -p $(DIST_DIR)
	@tar -czf $(DIST_DIR)/seo-planner-v$(VERSION).tar.gz -C $(BUILD_DIR) seo-planner/
	@echo "==> Package: $(DIST_DIR)/seo-planner-v$(VERSION).tar.gz"

# ---------------------------------------------------------------------------
# Validate
# ---------------------------------------------------------------------------

validate:
	@echo "==> Validating project structure..."
	@ERRORS=0; \
	for f in $(REQUIRED_FILES); do \
		if [ ! -f "$$f" ]; then \
			echo "  MISSING: $$f"; \
			ERRORS=$$((ERRORS + 1)); \
		fi; \
	done; \
	echo "==> Checking cross-references in SKILL.md..."; \
	for ref in $$(grep -oE 'references/[a-z0-9_-]+\.md' src/SKILL.md | sort -u); do \
		if [ ! -f "src/$$ref" ]; then \
			echo "  BROKEN REF: src/$$ref (referenced in SKILL.md)"; \
			ERRORS=$$((ERRORS + 1)); \
		fi; \
	done; \
	echo "==> Checking agent frontmatter..."; \
	for agent in $(AGENT_FILES); do \
		for field in name description tools model; do \
			if ! grep -q "^$$field:" "$$agent"; then \
				echo "  MISSING FIELD: $$field in $$agent"; \
				ERRORS=$$((ERRORS + 1)); \
			fi; \
		done; \
	done; \
	if [ $$ERRORS -gt 0 ]; then \
		echo "==> Validation FAILED ($$ERRORS errors)"; \
		exit 1; \
	else \
		echo "==> Validation passed"; \
	fi

# ---------------------------------------------------------------------------
# Lint & Test
# ---------------------------------------------------------------------------

lint:
	@echo "==> Syntax-checking .mjs files..."
	@ERRORS=0; \
	for f in $(MJS_FILES); do \
		if ! node --check "$$f" 2>/dev/null; then \
			echo "  SYNTAX ERROR: $$f"; \
			ERRORS=$$((ERRORS + 1)); \
		else \
			echo "  OK: $$f"; \
		fi; \
	done; \
	if [ $$ERRORS -gt 0 ]; then \
		echo "==> Lint FAILED ($$ERRORS errors)"; \
		exit 1; \
	else \
		echo "==> Lint passed"; \
	fi

test:
	@echo "==> Running tests..."
	@node --test src/scripts/bootstrap.test.mjs
	@echo "==> Tests passed"

# ---------------------------------------------------------------------------
# Clean
# ---------------------------------------------------------------------------

clean:
	@echo "==> Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR) $(DIST_DIR)
	@echo "==> Clean complete"
