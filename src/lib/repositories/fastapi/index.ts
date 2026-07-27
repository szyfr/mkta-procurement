import { ApiError } from "@/lib/http/errors";

import type { Repositories, RequestContext } from "../interfaces";
import { FastApiClient } from "./client";

/**
 * Placeholder FastAPI implementations.
 *
 * These are real classes that satisfy the interfaces and compile, rather than a
 * gap to be filled later — which means the type checker already proves the
 * remote backend can conform to the same contract the app is built against.
 * Each method throws until it is implemented; the transport they share
 * (`FastApiClient`) is complete.
 *
 * Migrating a single endpoint means replacing one `notImplemented` with a
 * `this.client.request(...)` call. Nothing above this layer changes.
 */

function notImplemented(operation: string): never {
  throw ApiError.notImplemented(
    `The FastAPI backend does not implement ${operation} yet. ` +
      "Set PROCUREMENT_BACKEND=sqlite to use the local database.",
  );
}

abstract class FastApiRepository {
  protected readonly client: FastApiClient;

  constructor(ctx: RequestContext) {
    this.client = new FastApiClient(ctx);
  }
}

class FastApiPurchaseRequestRepository extends FastApiRepository {
  // Reference implementation for the endpoints that follow:
  //
  //   async getById(id: string) {
  //     return this.client.request<PurchaseRequest>(`/purchase-requests/${id}`);
  //   }
  list() {
    return notImplemented("GET /purchase-requests");
  }
  getById() {
    return notImplemented("GET /purchase-requests/{id}");
  }
  create() {
    return notImplemented("POST /purchase-requests");
  }
  update() {
    return notImplemented("PATCH /purchase-requests/{id}");
  }
  delete() {
    return notImplemented("DELETE /purchase-requests/{id}");
  }
  submit() {
    return notImplemented("POST /purchase-requests/{id}/submit");
  }
  recordProofOfOrder() {
    return notImplemented(
      "POST /purchase-requests/{id}/items/{itemId}/proof-of-order",
    );
  }
}

class FastApiItemCreationRequestRepository extends FastApiRepository {
  list() {
    return notImplemented("GET /item-creation-requests");
  }
  create() {
    return notImplemented("POST /item-creation-requests");
  }
}

class FastApiCanvassingRepository extends FastApiRepository {
  listCases() {
    return notImplemented("GET /canvassing");
  }
  getDetail() {
    return notImplemented("GET /canvassing/{id}");
  }
  createBatch() {
    return notImplemented("POST /canvassing/{id}/batches");
  }
  addQuote() {
    return notImplemented("POST /canvassing/{id}/batches/{batch}/quotes");
  }
  selectVendor() {
    return notImplemented(
      "POST /canvassing/{id}/batches/{batch}/select-vendor",
    );
  }
}

class FastApiDashboardRepository extends FastApiRepository {
  get() {
    return notImplemented("GET /dashboard");
  }
}

class FastApiReportRepository extends FastApiRepository {
  list() {
    return notImplemented("GET /reports");
  }
  get() {
    return notImplemented("GET /reports/{id}");
  }
}

class FastApiNotificationRepository extends FastApiRepository {
  list() {
    return notImplemented("GET /notifications");
  }
  markRead() {
    return notImplemented("PATCH /notifications/{id}/read");
  }
  markAllRead() {
    return notImplemented("POST /notifications/read-all");
  }
}

class FastApiSearchRepository extends FastApiRepository {
  search() {
    return notImplemented("GET /search");
  }
}

class FastApiUserRepository extends FastApiRepository {
  list() {
    return notImplemented("GET /users");
  }
  listRolePermissions() {
    return notImplemented("GET /roles");
  }
  getAccount() {
    return notImplemented("GET /account");
  }
  updateAccount() {
    return notImplemented("PATCH /account");
  }
}

class FastApiReferenceRepository extends FastApiRepository {
  listDepartments() {
    return notImplemented("GET /departments");
  }
  listVendors() {
    return notImplemented("GET /vendors");
  }
  listPaymentTerms() {
    return notImplemented("GET /payment-terms");
  }
  listCatalogItems() {
    return notImplemented("GET /catalog-items");
  }
}

export function createFastApiRepositories(ctx: RequestContext): Repositories {
  return {
    purchaseRequests: new FastApiPurchaseRequestRepository(ctx),
    itemCreationRequests: new FastApiItemCreationRequestRepository(ctx),
    canvassing: new FastApiCanvassingRepository(ctx),
    dashboard: new FastApiDashboardRepository(ctx),
    reports: new FastApiReportRepository(ctx),
    notifications: new FastApiNotificationRepository(ctx),
    search: new FastApiSearchRepository(ctx),
    users: new FastApiUserRepository(ctx),
    reference: new FastApiReferenceRepository(ctx),
  };
}
