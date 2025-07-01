
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, CheckCircle } from "lucide-react";
import { SubTask, Project, Client } from "@/types";

interface PaymentTrackerProps {
  subTasks: SubTask[];
  projects: Project[];
  clients: Client[];
  onMarkAsPaid: (id: string, clientName: string) => void;
}

export const PaymentTracker = ({ subTasks, projects, clients, onMarkAsPaid }: PaymentTrackerProps) => {
  const pendingTasks = subTasks.filter(task => task.status === 'pending');
  const paidTasks = subTasks.filter(task => task.status === 'paid');
  
  const totalPending = pendingTasks.reduce((sum, task) => sum + task.amount, 0);
  const totalPaid = paidTasks.reduce((sum, task) => sum + task.amount, 0);

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getClientName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return 'Unknown Client';
    const client = clients.find(c => c.id === project.clientId);
    return client?.name || 'Unknown Client';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-yellow-900">Pending Payments</CardTitle>
                <p className="text-sm text-yellow-700">{pendingTasks.length} tasks</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              ${totalPending.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-green-900">Paid This Month</CardTitle>
                <p className="text-sm text-green-700">{paidTasks.length} tasks</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ${totalPaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments Table */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Pending Payments</CardTitle>
              <p className="text-sm text-gray-600">Tasks awaiting payment</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending payments at the moment</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Task</TableHead>
                    <TableHead className="font-semibold text-gray-900">Project</TableHead>
                    <TableHead className="font-semibold text-gray-900">Client</TableHead>
                    <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-900">Due Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {task.name}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {getProjectName(task.projectId)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {getClientName(task.projectId)}
                      </TableCell>
                      <TableCell className="font-semibold text-orange-600">
                        {task.amount.toLocaleString()} {task.currency}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => onMarkAsPaid(task.id, getClientName(task.projectId))}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark as Paid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Paid Payments */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Payments</CardTitle>
              <p className="text-sm text-gray-600">Recently completed payments</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paidTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paidTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                    <p className="text-sm text-gray-600">
                      {getProjectName(task.projectId)} - {getClientName(task.projectId)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {task.amount.toLocaleString()} {task.currency}
                    </p>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Paid
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
