"use client";

import { BuildingIcon } from "lucide-react";

import {
  type EntityCrudConfig,
  EntityPageContent,
} from "@/components/shared/entity-crud";
import {
  type CreateDepartmentDto,
  createDepartment,
  type Department,
  deleteDepartment,
  departmentKeys,
  departmentListQuery,
  updateDepartment,
} from "@/modules/departments";

const config: EntityCrudConfig<Department, CreateDepartmentDto> = {
  entityLabel: "Department",
  titlePlaceholder: 'e.g. "IT"',
  descriptionPlaceholder: 'e.g. "IT Department"',
  emptyStateIcon: <BuildingIcon />,
  emptyStateTitle: "No departments yet",
  emptyStateDescription:
    "Create one to start assigning purchase requests to a department.",
  pageTitle: "Departments",
  pageDescription: "Manage the departments purchase requests are assigned to",
  createDescription: "Add a department purchase requests can be assigned to.",
  newButtonLabel: "New Department",
  basePath: "/departments",
  queryKeys: departmentKeys,
  listQuery: departmentListQuery,
  create: createDepartment,
  update: updateDepartment,
  remove: deleteDepartment,
};

export function DepartmentsPageContent({ page }: { page: number }) {
  return <EntityPageContent page={page} config={config} />;
}
