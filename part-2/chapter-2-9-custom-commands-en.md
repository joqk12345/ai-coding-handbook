# 2.9: Creating Custom Commands

`2.1 > 2.2 > 2.3 > 2.4 > 2.5 > 2.6 > 2.7 > 2.8 | [ 2.9 ] 2.10 > 2.11`

> *"Solidify repetitive workflows into a single command"* -- Custom commands make team conventions executable contracts.

## Problem

In daily development, there are many high-frequency repetitive tasks:
- Running test suites and generating reports
- Committing code according to team conventions
- Generating boilerplate code for specific files
- Executing security checks and dependency audits

Each time these tasks are executed, you need to:
1. Recall the correct execution steps
2. Manually input multiple lines of commands
3. Ensure compliance with team conventions
4. Verify execution results

This process is not only time-consuming but also prone to errors due to human oversight.

## Solution

```
+-------------------+      +-------------------+      +-------------------+
|   User Input      |      |   Custom Command  |      |   Automated Exec  |
|   /audit          | ---> |   Parse & Match   | ---> |   npm audit       |
|   /test-api       |      |   Arg Replace     |      |   Report Gen      |
|   /deploy         |      |   Tool Invoke     |      |   Verify Check    |
+-------------------+      +-------------------+      +-------------------+
        ^                                                    |
        |                                                    v
        +---------------------------------------------- Result Feedback
```

The essence of custom commands: **Solidifying high-frequency, repetitive, and standardized workflows into reusable command entry points**.

Core design principles:

| Principle | Description | Example |
|-----------|-------------|---------|
| Single Entry | One command corresponds to one clear task | `/audit` only handles security audits |
| Parameterization | Supports variable input, enhances reusability | `/test $FILE` tests specified file |
| Tool Binding | Declares callable tools, defines capability boundaries | `tools: Read, Bash` |
| Text as Code | Markdown + FrontMatter definition | Version control friendly |

## How It Works

### 1. Command File Structure

Custom commands are stored as Markdown files using FrontMatter for metadata:

```markdown
---
name: audit
description: Run npm audit to check and fix security vulnerabilities
tools: Bash
---

Run npm audit to identify vulnerable installed packages
Run npm audit fix to apply updates
Run tests to verify updates didn't break functionality
```

**Storage locations and scope:**

```
Project-level (recommended)
├── .claude/
│   └── commands/           # Command storage directory
│       ├── audit.md        # /audit command
│       ├── test-api.md     # /test-api command
│       └── deploy.md       # /deploy command
│
User-level (global)
~/.claude/commands/         # Effective for all projects on this machine
```

Project-level commands are recommended to avoid user-level commands accidentally affecting unrelated repositories.

### 2. Command Parsing and Matching

When a user inputs a slash command, Claude executes the following matching logic:

```python
# Pseudocode illustration
class CommandManager:
    def __init__(self):
        self.commands = self._load_commands()

    def _load_commands(self):
        """Load all commands from .claude/commands/"""
        commands = {}
        for cmd_file in Path('.claude/commands').glob('*.md'):
            cmd = self._parse_command(cmd_file)
            commands[cmd['name']] = cmd
        return commands

    def execute(self, command_name, arguments=None):
        """Execute matched command"""
        if command_name not in self.commands:
            return f"Unknown command: {command_name}"

        cmd = self.commands[command_name]

        # Verify permissions: check command-declared tools
        allowed_tools = cmd.get('tools', [])

        # Argument replacement
        prompt = cmd['content']
        if arguments:
            prompt = prompt.replace('$ARGUMENTS', arguments)

        # Execute command prompt
        return self._execute_with_tools(prompt, allowed_tools)
```

### 3. Parameterized Commands

Custom commands support `$ARGUMENTS` placeholders for accepting parameters:

```markdown
---
name: write_tests
description: Write comprehensive tests for specified files
tools: Read, Write
---

Write comprehensive tests for: $ARGUMENTS

Testing conventions:
* Use Vitests with React Testing Library
* Place test files in __tests__ directory alongside source files
* Name test files [filename].test.ts(x)
* Use @/ prefix for imports

Coverage:
* Test happy paths
* Test edge cases
* Test error states
```

Usage:

```
/write_tests hooks directory use-auth.ts file
```

### 4. Tool Permission Declarations

Commands declare callable tools via the `tools` field in FrontMatter, which defines permission boundaries:

```markdown
---
name: deploy
description: Deploy application to production
tools: Bash, Read, Write
---
```

Tool permission types:

| Tool Type | Purpose | Example |
|-----------|---------|---------|
| Bash | Execute commands | `Bash(npm run build)` |
| Read | Read files | `Read` |
| Write | Write files | `Write` |
| Edit | Edit files | `Edit` |

## Usage Examples

### Example 1: Git Commit Convention Command

```markdown
---
name: commit
description: Execute Git commit according to team conventions
tools: Bash, Read
---

Execute commit following these steps:

1. Check if current branch name follows convention (feature|bugfix|hotfix)/JIRA-ID-description
2. Run `git status` to view changed files
3. Run `git diff --cached` to view staged content
4. Write commit message following convention:
   - Type: Description (within 50 characters)
   - Empty line
   - Detailed explanation (optional)
5. Execute `git commit`
6. If it's a feature branch, prompt whether push is needed
```

### Example 2: API Endpoint Testing Command

```markdown
---
name: test-api
description: Test specified API endpoints
tools: Bash, Read
---

Test API endpoint: $ARGUMENTS

Execution steps:
1. Read API documentation or route definitions
2. Construct test request (including necessary headers, body)
3. Send request using curl or httpie
4. Verify response status code and structure
5. If failed, analyze error cause and provide fix suggestions

Test coverage:
- Normal request (200 OK)
- Invalid parameters (400 Bad Request)
- Unauthorized access (401 Unauthorized)
- Resource not found (404 Not Found)
```

### Example 3: Code Review Command

```markdown
---
name: review
description: Review code quality of specified files
tools: Read
---

Review code quality of: $ARGUMENTS

Review checklist:
□ Code readability (naming, comments, structure)
□ Potential bugs (null pointers, resource leaks, race conditions)
□ Performance issues (unnecessary loops, inefficient algorithms)
□ Security vulnerabilities (injection, XSS, sensitive info exposure)
□ Test coverage (edge cases, error paths)
□ Project convention compliance (style, architecture patterns)

Output format:
- Critical issues (must fix)
- Improvement suggestions (recommended)
- Positive feedback (what's done well)
```

## Change Comparison

| Component | Before | After (2.9) |
|-----------|--------|-------------|
| Repetitive task execution | Manual multi-line command input | Single `/command` execution |
| Team conventions | Verbally/documented conveyed | Solidified into executable commands |
| Permission control | No clear boundaries | FrontMatter-declared tool permissions |
| Parameterization | Hard-coded | `$ARGUMENTS` variable substitution |
| Maintainability | Scattered across scripts | Centralized management, version control friendly |

## Best Practices

### Command Design Principles

1. **Single Responsibility**: One command does one thing
   ```markdown
   # Good
   /deploy - Only handles deployment

   # Bad
   /deploy-and-test - Mixed responsibilities
   ```

2. **Clear Description**: Description includes trigger conditions and expected behavior
   ```markdown
   description: When API endpoint verification is needed, test specified interface and return status report
   ```

3. **Minimal Permissions**: Only declare necessary tools
   ```markdown
   # Good
   tools: Read, Bash(npm:*)

   # Bad (over-permissioned)
   tools: Read, Write, Edit, Bash
   ```

4. **Parameter Validation**: Validate `$ARGUMENTS`
   ```markdown
   Execution steps:
   1. Verify $ARGUMENTS is not empty
   2. Verify file $ARGUMENTS exists
   3. Execute operation
   ```

### Command Organization Suggestions

```
.claude/commands/
├── dev/                    # Development related
│   ├── start-dev.md
│   ├── run-tests.md
│   └── lint-fix.md
├── deploy/                 # Deployment related
│   ├── deploy-staging.md
│   └── deploy-prod.md
├── review/                 # Code review
│   ├── review-code.md
│   └── security-check.md
└── utils/                  # General utilities
    ├── git-commit.md
    └── update-deps.md
```

Through proper design and organization of custom commands, teams can solidify best practices into executable standards, significantly improving development efficiency and code quality consistency.
