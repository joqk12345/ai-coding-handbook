# 2.11: GitHub Integration

`2.1 > 2.2 > 2.3 > 2.4 > 2.5 > 2.6 > 2.7 > 2.8 > 2.9 > 2.10 | [ 2.11 ]`

> *"Transform Claude from a development assistant into an automated team member"* -- GitHub integration makes AI a formal participant in code review and problem solving.

## Problem

In daily development workflows, development teams face the following challenges:

- **Heavy code review burden**: Each Pull Request requires manual review, which is time-consuming and prone to missing issues
- **Slow issue response**: Issues need to wait for manual review and assignment
- **Repetitive tasks**: Label addition, milestone setting, branch protection, and other mechanical work
- **Difficult knowledge transfer**: Suggestions and experiences from code reviews are hard to preserve and reuse
- **Cross-timezone collaboration difficulties**: When teams are distributed across different timezones, reviews and feedback are delayed

Existing CI/CD tools can execute automated tests but lack "understanding" of code, unable to provide intelligent review suggestions.

## Solution

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Platform                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │
│  │   Issues     │  │ Pull Requests│  │   GitHub Actions     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────┘     │
│         │                 │                     │                │
│         └─────────────────┴─────────────────────┘                │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │  Claude Code GitHub App  │                        │
│              │  - Issue Mentions        │                        │
│              │  - PR Reviews            │                        │
│              │  - Custom Workflows      │                        │
│              └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │         Claude Code           │
                    │  ┌───────────────────────┐    │
                    │  │   Agent Loop          │    │
                    │  │   - Task Planning     │    │
                    │  │   - Code Analysis     │    │
                    │  │   - Review Generation │    │
                    │  └───────────────────────┘    │
                    └───────────────────────────────┘
```

Core value of GitHub integration:

| Capability | Description | Benefit |
|------------|-------------|---------|
| Intelligent Code Review | Automatically analyze PR changes, provide detailed review reports | Reduce manual review burden, improve code quality |
| Automated Issue Response | Trigger intelligent analysis and processing through @claude mentions | Shorten issue response time |
| Workflow Automation | Customize GitHub Actions workflows | Reduce repetitive manual work |
| Knowledge Preservation | Review suggestions can be solidified as team conventions | Promote best practice inheritance |

## How It Works

### 1. Integration Setup Flow

**Step 1: Install GitHub App**

```bash
# Run in Claude Code
/install-github-app
```

This interactive command will:
1. Navigate to GitHub app installation page
2. Guide selection of repositories to authorize
3. Configure API key
4. Automatically generate Pull Request containing workflow files

**Step 2: Merge Workflow PR**

The generated Pull Request adds the following files in `.github/workflows`:

```yaml
# .github/workflows/claude-issue.yml
name: Claude Issue Assistant

on:
  issue_comment:
    types: [created]
  issues:
    types: [opened]

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude') || github.event.action == 'opened'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

**Step 3: Verify Integration**

After merging PR, test via:
1. Create new Issue with `@claude` in comment
2. Create Pull Request, wait for automatic review

### 2. Issue Mention Workflow

When users mention `@claude` in Issues or comments:

```python
# GitHub Actions workflow triggered
on:
  issue_comment:
    types: [created]

# Condition check
if contains(github.event.comment.body, '@claude'):
    # 1. Checkout repository
    checkout_repository()

    # 2. Prepare Claude Code environment
    setup_claude_code()

    # 3. Build task prompt
    prompt = f"""
    User requested help in Issue #{issue_number}:

    Issue title: {issue_title}
    Issue description: {issue_body}
    User comment: {comment_body}

    Please:
    1. Analyze root cause
    2. Create task plan
    3. Execute necessary code changes
    4. Reply in Issue with results and suggestions
    """

    # 4. Run Claude Code
    result = run_claude_code(prompt)

    # 5. Reply result to Issue
    post_issue_comment(issue_number, result.output)
```

### 3. Pull Request Review Workflow

When creating or updating Pull Requests, automatic review is triggered:

```python
# GitHub Actions workflow triggered
on:
  pull_request:
    types: [opened, synchronize]

# Review process
def review_pull_request(pr):
    # 1. Get PR diff
    diff = get_pr_diff(pr.number)

    # 2. Get related file contents
    files = get_pr_files(pr.number)

    # 3. Build review prompt
    prompt = f"""
    Please review the following Pull Request:

    PR title: {pr.title}
    PR description: {pr.body}

    Changed files:
    {format_files(files)}

    Code diff:
    ```diff
    {diff}
    ```

    Please provide detailed code review report including:
    1. Change overview (what and why)
    2. Code quality assessment (readability, maintainability, performance)
    3. Potential issues (bugs, security risks, edge cases)
    4. Improvement suggestions (specific code examples)
    5. Overall evaluation (approve / comment / request changes)
    """

    # 4. Run Claude Code
    result = run_claude_code(prompt)

    # 5. Submit review comment
    post_pr_review(pr.number, result.output)
```

## Change Comparison

| Component | Before | After (2.11) |
|-----------|--------|--------------|
| Code review | Purely manual, time-consuming | AI-assisted, automatic + human review |
| Issue response | Depends on manual assignment | @claude intelligent analysis and processing |
| Workflow | Manual execution of repetitive tasks | Automated, customizable |
| Knowledge preservation | Personal experience hard to reuse | Review suggestions can be solidified as conventions |
| Cross-timezone collaboration | Waiting for review delays | 24/7 automatic preliminary review |

## Best Practices

### GitHub Integration Setup Recommendations

1. **Start small, expand gradually**
   - First enable automatic PR reviews
   - Verify effectiveness before adding Issue responses
   - Finally customize workflows

2. **Combine with project context**
   - Provide project structure in `custom-instructions`
   - Explain technology stack and architectural constraints
   - Specify team coding conventions

3. **Progressive authorization**
   - Retain human confirmation initially
   - Gradually relax after establishing trust
   - Regularly audit automation logs

4. **Continuous optimization**
   - Analyze quality of Claude's review suggestions
   - Adjust custom instructions based on feedback
   - Supplement project-specific best practices

### Efficient Collaboration Workflow

```
1. Developer submits PR
   ↓
2. Claude automatically reviews
   - Code quality assessment
   - Potential issue identification
   - Improvement suggestions
   ↓
3. Human review
   - Review Claude's suggestions
   - Supplement human review when necessary
   - Decide approve/request changes
   ↓
4. Issue fixes
   - @claude assists with problem analysis (optional)
   - Developer implements fixes
   ↓
5. Merge
   - Merge after verification passes
   - Claude's review record archived
```

By strategically using GitHub integration, teams can transform Claude from a development assistant into an automated team member that can participate 24/7 in code review, issue handling, and knowledge preservation. This is not just adding a tool, but deeply integrating AI capabilities into your development lifecycle.
