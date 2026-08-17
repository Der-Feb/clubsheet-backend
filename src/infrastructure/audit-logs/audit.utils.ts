export interface IAuditTemplate {
    type: string;
    description: string;
}

export const auditLogDescriptions: IAuditTemplate[] = [
    {
        type: "auth-register",
        description: "Person {person_id} registered and created user account {user_id}"
    },
    {
        type: "auth-login",
        description: "User with account {user_id} logged in the system"
    }
];

export function generateAuditDescription(
    actionType: string, 
    metadata: Record<string, any>, 
    templates: IAuditTemplate[] = auditLogDescriptions
): string {
    const match = templates.find(t => t.type === actionType);
    
    if (!match) {
        return `Executed action: ${actionType}`;
    }

    let description = match.description;

    if (metadata) {
        Object.keys(metadata).forEach((key) => {
            description = description.replace(new RegExp(`{${key}}`, 'g'), String(metadata[key] ?? ''));
        });
    }

    return description;
}