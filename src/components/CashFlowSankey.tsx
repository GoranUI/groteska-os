import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface CashFlowSankeyProps {
  incomes: any[];
  expenses: any[];
  exchangeRates: { USD: number; EUR: number; };
}

export const CashFlowSankey = ({ 
  incomes, 
  expenses, 
  exchangeRates 
}: CashFlowSankeyProps) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    // Convert all amounts to RSD
    const convertToRSD = (amount: number, currency: string) => {
      const rate = currency === "RSD" ? 1 : exchangeRates[currency as keyof typeof exchangeRates] || 1;
      return amount * rate;
    };

    // Calculate income sources
    const incomeByCategory = incomes.reduce<Record<string, number>>((acc, income) => {
      const amountRSD = convertToRSD(Number(income.amount), income.currency);
      acc[income.category] = (acc[income.category] || 0) + amountRSD;
      return acc;
    }, {});

    // Calculate expenses by category
    const expensesByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
      const amountRSD = convertToRSD(Number(expense.amount), expense.currency);
      acc[expense.category] = (acc[expense.category] || 0) + amountRSD;
      return acc;
    }, {});


    const totalIncome = Object.values(incomeByCategory).reduce<number>((sum, amount) => sum + amount, 0);
    const totalExpenses = Object.values(expensesByCategory).reduce<number>((sum, amount) => sum + amount, 0);

    // Create nodes
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let yPosition = 0;
    const nodeHeight = 60;
    const nodeSpacing = 80;

    // Income source nodes (left side)
    Object.entries(incomeByCategory).forEach(([category, amount], index) => {
      nodes.push({
        id: `income-${category}`,
        type: 'default',
        position: { x: 0, y: yPosition },
        data: { 
          label: `${category}\n${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} RSD`
        },
        style: { 
          backgroundColor: 'hsl(142 76% 36% / 0.1)',
          border: '2px solid hsl(142 76% 36%)',
          borderRadius: '8px',
          padding: '8px',
          width: 180,
          fontSize: '12px'
        }
      });
      yPosition += nodeSpacing;
    });

    // Main flow node (center)
    const centerY = (Object.keys(incomeByCategory).length * nodeSpacing) / 2;
    nodes.push({
      id: 'total-income',
      type: 'default',
      position: { x: 250, y: centerY - nodeHeight / 2 },
      data: { 
        label: `Total Income\n${totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })} RSD`
      },
      style: { 
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        border: '2px solid hsl(var(--primary))',
        borderRadius: '8px',
        padding: '8px',
        width: 150,
        fontSize: '12px',
        fontWeight: 'bold'
      }
    });

    // Expense nodes (right side)
    yPosition = 0;
    Object.entries(expensesByCategory).forEach(([category, amount], index) => {
      nodes.push({
        id: `expense-${category}`,
        type: 'default',
        position: { x: 500, y: yPosition },
        data: { 
          label: `${category}\n${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} RSD`
        },
        style: { 
          backgroundColor: 'hsl(0 84% 60% / 0.1)',
          border: '2px solid hsl(0 84% 60%)',
          borderRadius: '8px',
          padding: '8px',
          width: 180,
          fontSize: '12px'
        }
      });
      yPosition += nodeSpacing;
    });


    // Create edges
    Object.keys(incomeByCategory).forEach(category => {
      edges.push({
        id: `edge-income-${category}`,
        source: `income-${category}`,
        target: 'total-income',
        type: 'smoothstep',
        style: { stroke: 'hsl(142 76% 36%)', strokeWidth: 2 }
      });
    });

    Object.keys(expensesByCategory).forEach(category => {
      edges.push({
        id: `edge-expense-${category}`,
        source: 'total-income',
        target: `expense-${category}`,
        type: 'smoothstep',
        style: { stroke: 'hsl(0 84% 60%)', strokeWidth: 2 }
      });
    });


    return { nodes, edges };
  }, [incomes, expenses, exchangeRates]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Cash Flow Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Income sources and expense categories flow visualization
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-muted/30 rounded-lg border">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 20 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            panOnDrag={false}
          >
            <Background color="hsl(var(--muted-foreground))" gap={16} />
            <MiniMap 
              nodeColor="hsl(var(--primary))" 
              maskColor="hsl(var(--background) / 0.8)"
              style={{ backgroundColor: 'hsl(var(--muted))' }}
            />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};