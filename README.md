# AI Math Agent

An AI agent that can do math for you! Give it a math problem with multiple steps, and it will solve it step by step using tools.

## What does it do?

This agent can:
- Add numbers
- Multiply numbers  
- Divide numbers
- Handle complex math problems with multiple steps

For example, you can ask it: *"Add 6 and 8, then multiply that by 5, and divide it by 4"* and it will work through each step.

## Why is it needed?

<img width="1428" height="667" alt="image" src="https://github.com/user-attachments/assets/d2758467-9c66-4b1a-aa97-8e36d059342f" />

LLMs rely only on static pretrained data, which limits their ability to answer realtime or external queries (e.g., today’s date)


## Architecture

<img width="1396" height="717" alt="image" src="https://github.com/user-attachments/assets/18c56ca0-0aaf-4e67-a66d-1c525d2e11a9" />



## Tech Stack

- **LangChain** - For building the AI agent
- **LangGraph**: Manages the conversation flow
- **Claude** - The AI model
- **Zod** - For data validation

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up your API key**

   Create a `.env` file and add relevant keys, see .env.example

3. **Run it**
   ```bash
   tsc -b
   node .\dist\index.js 
   ```
