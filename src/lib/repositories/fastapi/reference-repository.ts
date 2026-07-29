import type { CatalogItemPage } from "@/types";

import type { ReferenceRepository } from "../interfaces";
import type { FastApiClient } from "./client";
import { catalogPage, listDepartmentNames, listVendorNames } from "./directory";

/**
 * Master data for the pickers.
 *
 * Departments, vendors and the material catalog come from the backend (by way
 * of the directory cache, which is what makes the name↔id translation the rest
 * of the repository layer relies on possible). Payment terms have no upstream
 * collection at all.
 */
export class FastApiReferenceRepository implements ReferenceRepository {
    constructor(private readonly client: FastApiClient) {}

    listDepartments(): Promise<string[]> {
        return listDepartmentNames(this.client);
    }

    listVendors(): Promise<string[]> {
        return listVendorNames(this.client);
    }

    async listPaymentTerms(): Promise<string[]> {
        // TODO(backend): no payment terms collection exists upstream. Answering
        // with no terms leaves the vendor quote form's picker empty instead of
        // failing the form around it — and that form is already blocked on the
        // canvassing write endpoints it submits to.
        return [];
    }

    listCatalogItems(page: number, pageSize: number): Promise<CatalogItemPage> {
        return catalogPage(this.client, page, pageSize);
    }
}
