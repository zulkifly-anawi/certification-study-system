import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminCertifications() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: "", name: "", description: "" });

  const { data: certifications = [], isLoading, refetch } = trpc.certifications.getAll.useQuery();
  const addMutation = trpc.admin.addCertification.useMutation();
  const updateMutation = trpc.admin.updateCertification.useMutation();
  const deleteMutation = trpc.admin.deleteCertification.useMutation();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page</p>
          <Button onClick={() => navigate("/")} variant="default">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Code and Name are required");
      return;
    }

    try {
      await addMutation.mutateAsync(formData);
      toast.success("Certification added successfully");
      setFormData({ code: "", name: "", description: "" });
      setIsAddOpen(false);
      refetch();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to add certification";
      toast.error(errorMsg);
    }
  };

  const handleUpdate = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Code and Name are required");
      return;
    }

    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Certification updated successfully");
      setFormData({ code: "", name: "", description: "" });
      setEditingCode(null);
      refetch();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to update certification";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteMutation.mutateAsync({ code });
      toast.success("Certification deleted successfully");
      refetch();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete certification";
      toast.error(errorMsg);
    }
  };

  const startEdit = (cert: any) => {
    setFormData({ code: cert.code, name: cert.name, description: cert.description || "" });
    setEditingCode(cert.code);
  };

  const cancelEdit = () => {
    setFormData({ code: "", name: "", description: "" });
    setEditingCode(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/import")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Manage Certifications</h1>
              <p className="text-gray-600 mt-1">Add, edit, or delete certification programs</p>
            </div>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Certification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Certification</DialogTitle>
                <DialogDescription>
                  Create a new certification program
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <Input
                    placeholder="e.g., CAPM, PSM1, PMP"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    disabled={addMutation.isPending}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g., Certified Associate in Project Management"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={addMutation.isPending}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Brief description of the certification"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={addMutation.isPending}
                  />
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={addMutation.isPending}
                  className="w-full"
                >
                  {addMutation.isPending ? "Adding..." : "Add Certification"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Certifications List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Loading certifications...</p>
              </CardContent>
            </Card>
          ) : certifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No certifications found</p>
              </CardContent>
            </Card>
          ) : (
            certifications.map((cert: any) => (
              <Card key={cert.code}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{cert.name}</CardTitle>
                      <CardDescription>Code: {cert.code}</CardDescription>
                      {cert.description && (
                        <p className="text-sm text-gray-600 mt-2">{cert.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingCode === cert.code} onOpenChange={(open) => {
                        if (!open) cancelEdit();
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(cert)}
                            className="gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Certification</DialogTitle>
                            <DialogDescription>
                              Update certification details
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Code</label>
                              <Input
                                value={formData.code}
                                disabled
                                className="bg-gray-100"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Name</label>
                              <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={updateMutation.isPending}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Description</label>
                              <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                disabled={updateMutation.isPending}
                              />
                            </div>
                            <Button
                              onClick={handleUpdate}
                              disabled={updateMutation.isPending}
                              className="w-full"
                            >
                              {updateMutation.isPending ? "Updating..." : "Update Certification"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Certification?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Make sure there are no questions associated with this certification.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cert.code)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
