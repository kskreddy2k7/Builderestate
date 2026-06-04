"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyAuth = exports.IS_API_KEY_AUTH = exports.OrgId = exports.Public = exports.IS_PUBLIC_KEY = exports.Roles = exports.ROLES_KEY = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
// ─── Roles ────────────────────────────────────────────────────────────────────
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
// ─── Public ───────────────────────────────────────────────────────────────────
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
// ─── OrgId param ─────────────────────────────────────────────────────────────
exports.OrgId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.orgId;
});
// ─── API Key ─────────────────────────────────────────────────────────────────
exports.IS_API_KEY_AUTH = 'isApiKeyAuth';
const ApiKeyAuth = () => (0, common_1.SetMetadata)(exports.IS_API_KEY_AUTH, true);
exports.ApiKeyAuth = ApiKeyAuth;
//# sourceMappingURL=index.js.map