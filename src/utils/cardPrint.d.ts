// Type declarations for card print utilities

export type CardType = "member" | "team" | "staff";

export interface CardData {
    id: string | number;
    nameAr?: string;
    nameEn?: string;
    memberId?: string;
    memberType?: string;
    phone?: string;
    nationalId?: string;
    photoUrl?: string;
    jobTitle?: string;
    staffType?: string;
    sport?: string;
    validUntil?: string;
    issueDate?: string;
    barcode?: string;
}

export interface MemberCardPreviewProps {
    data: CardData;
    type?: CardType;
    scale?: number;
}

export interface PrintOptions {
    data: CardData;
    type?: CardType;
}

declare function MemberCardPreview(props: MemberCardPreviewProps): JSX.Element;
declare function printMemberTeamCard(options: PrintOptions): void;

export default MemberCardPreview;
export { printMemberTeamCard };
