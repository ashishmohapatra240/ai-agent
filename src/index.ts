import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatAnthropic } from "@langchain/anthropic";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import {
  AIMessage,
  isAIMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";

import { config } from "dotenv";

config();

type State = typeof MessagesAnnotation.State;

const llm = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_KEY || "",
  model: "claude-3-5-sonnet-20241022",
});

const multiply = tool(
  async ({ a, b }: { a: number; b: number }) => {
    return a * b;
  },
  {
    name: "multiply",
    description: "multiply to numbers",
    schema: z.object({
      a: z.number().describe("first number"),
      b: z.number().describe("second number"),
    }),
  }
);

const divide = tool(
  async ({ a, b }: { a: number; b: number }) => {
    return a / b;
  },
  {
    name: "divide",
    description: "divide two numbers",
    schema: z.object({
      a: z.number().describe("first number"),
      b: z.number().describe("second number"),
    }),
  }
);

const add = tool(
  async ({ a, b }: { a: number; b: number }) => {
    return a + b;
  },
  {
    name: "add",
    description: "add two numbers",
    schema: z.object({
      a: z.number().describe("first number"),
      b: z.number().describe("second number"),
    }),
  }
);

const tools = [add, multiply, divide];
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
const llmWithTools = llm.bindTools(tools);

async function llmcall(state: State) {
  const result = await llmWithTools.invoke([
    {
      role: "system",
      content:
        "You are a helpful assistant tasked with performing arithmatic on a set of inputs",
    },
    ...state.messages,
  ]);
  return {
    messages: [result],
  };
}

export async function toolNode(state: State) {
  const out: ToolMessage[] = [];
  const last: BaseMessage | undefined = state.messages.at(-1);

  if (last && isAIMessage(last) && last.tool_calls?.length) {
    for (const tc of last.tool_calls) {
      const t = toolsByName[tc.name];
      if (!t) continue;
      const observation = await t.invoke(tc.args as any);
      out.push(
        new ToolMessage({
          content:
            typeof observation === "string"
              ? observation
              : JSON.stringify(observation),
          tool_call_id: tc.id!,
        })
      );
    }
  }

  return { messages: out };
}

function shouldContiue(state: State) {
  const messages = state.messages;
  const last: BaseMessage | undefined = state.messages.at(-1);

  if (last && isAIMessage(last) && last.tool_calls?.length) {
    return "Action";
  }
  return "__end__";
}

const agentBuilder = new StateGraph(MessagesAnnotation)
  .addNode("llmcall", llmcall)
  .addNode("tools", toolNode)
  .addEdge("__start__", "llmcall")
  .addConditionalEdges("llmcall", shouldContiue, {
    Action: "tools",
    __end__: "__end__",
  })
  .addEdge("tools", "llmcall")
  .compile();

const messages = [
  {
    role: "user",
    content: "Add 6 and 8 then multiple that by 5 and divide it by 4",
  },
];

const result = await agentBuilder.invoke({ messages });
console.log(result.messages);
