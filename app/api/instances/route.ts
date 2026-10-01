import {
  instantiateComponent,
  updateInstanceState,
  getInstanceState,
  listInstallations,
  brokerStateHandoff,
} from "@/server/mcp-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  try {
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required (instantiate, update, handoff, get, list)" },
        { status: 400 }
      );
    }

    // INSTANTIATE: Create new pattern instance
    if (action === "instantiate") {
      const { slug, initial_state, agent_id, persistent } = body;

      if (!slug) {
        return NextResponse.json(
          { error: "Pattern slug is required" },
          { status: 400 }
        );
      }

      const instance = await instantiateComponent(
        slug,
        initial_state || {},
        agent_id,
        persistent || false
      );

      if (!instance) {
        return NextResponse.json(
          { error: `Pattern not found: ${slug}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        action: "instantiate",
        success: true,
        instance,
      });
    }

    // UPDATE: Modify instance state
    if (action === "update") {
      const { instance_id, updates } = body;

      if (!instance_id || !updates) {
        return NextResponse.json(
          { error: "instance_id and updates are required" },
          { status: 400 }
        );
      }

      const instance = await updateInstanceState(instance_id, updates);

      if (!instance) {
        return NextResponse.json(
          { error: `Instance not found: ${instance_id}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        action: "update",
        success: true,
        instance,
      });
    }

    // GET: Retrieve instance state
    if (action === "get") {
      const { instance_id } = body;

      if (!instance_id) {
        return NextResponse.json(
          { error: "instance_id is required" },
          { status: 400 }
        );
      }

      const instance = await getInstanceState(instance_id);

      if (!instance) {
        return NextResponse.json(
          { error: `Instance not found: ${instance_id}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        action: "get",
        success: true,
        instance,
      });
    }

    // LIST: Get all installations for an agent
    if (action === "list") {
      const { agent_id } = body;

      const list = await listInstallations(agent_id);

      return NextResponse.json({
        action: "list",
        success: true,
        agent_id: agent_id || "all",
        count: list.length,
        installations: list,
      });
    }

    // HANDOFF: Transfer from one pattern to another
    if (action === "handoff") {
      const { from_instance_id, to_component_slug, to_agent_id, context_data } = body;

      if (!from_instance_id || !to_component_slug || !to_agent_id) {
        return NextResponse.json(
          {
            error:
              "from_instance_id, to_component_slug, and to_agent_id are required",
          },
          { status: 400 }
        );
      }

      const newInstance = await brokerStateHandoff(
        from_instance_id,
        to_component_slug,
        to_agent_id,
        context_data
      );

      if (!newInstance) {
        return NextResponse.json(
          { error: "Handoff failed: source instance or target component not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        action: "handoff",
        success: true,
        from_instance_id,
        to_instance_id: newInstance.instanceId,
        instance: newInstance,
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Instance error:", error);
    return NextResponse.json(
      { error: "Failed to process instance request" },
      { status: 500 }
    );
  }
}
