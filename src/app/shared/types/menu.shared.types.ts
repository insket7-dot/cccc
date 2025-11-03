export interface MenuModel {
    id: string;
    name: string;
    category: string;
    price: number;
    tags?: string[];
    keywords?: string[];
    created_at?: string;
    updated_at?: string;
}

export const MenuTable = 'menus' as const;
export const MenuFields = {
    id: 'id',
    name: 'name',
    category: 'category',
    price: 'price',
    tags: 'tags',
    keywords: 'keywords',
    created_at: 'created_at',
    updated_at: 'updated_at',
} as const;
export type MenuFieldKey = keyof typeof MenuFields;

export interface MenuData {
    id: string;
    name: string;
    category: string;
    price: number;
    tags?: string[];
    keywords?: string[];
}

/**
 * @desc 菜单子项
 */
export interface menuListItem {
    quantity: number; // 购物车中数量
    crossedOutPrice: number;
    dataFrom: string;
    dayOfWeek: string;
    descriptionCn: string;
    end_date: string;
    grillList: MenuGrillItem[];
    id: number;
    imageUrl: string;
    isShow: string;
    jdCategoryInfo: {
        backCategoryId: number;
        backCategoryName: string;
        propertyInfoList: Array<{
            propertyId: number;
            propertyName: string;
            values: Array<{
                propertyId?: number;
                propertyName: string;
            }>;
        }>;
    };
    manageCategory: string;
    materialList: any[];
    maxQty: number;
    mealType: string;
    minQty: number;
    mutexList: any[];
    packagingFee: number;
    packagingType: string;
    packagingTypeCode: string;
    price: number;
    productId: string;
    productNameCn: string;
    productNameEn: string;
    productNameShort: string;
    productType: string;
    production_time: string;
    resourceList: any[];
    sellTimeList: Array<{
        friday: string;
        monday: string;
        saturday: string;
        sunday: string;
        thursday: string;
        tuesday: string;
        wednesday: string;
    }>;
    setMealList: MenuRoundItem[];
    single_no_delivery: string;
    sliderUrlList: any[];
    sort: number;
    specList: MenuSpecItem[];
    start_date: string;
    stockStatus: string;
    upLowStatus: string;
}

/**
 * @desc 套餐-轮次
 */
export interface MenuRoundItem {
    fixed: string;
    isShow: string;
    itemList: MenuRoundItemSku[];
    optionalMinQuantity: number;
    optionalQuantity: number;
    round: number;
    roundNameCn: string;
}

/**
 * @desc 套餐-轮次-子项
 */
export interface MenuRoundItemSku {
    addPrice: number;
    defaultFlag: string;
    defaultQuantity: number;
    end_date: string;
    freeFlag: string;
    lQuantity: number;
    lowerStatus: string;
    originalPrice: number;
    price: number;
    productId: string;
    productName: string;
    productNameEn: string;
    sellTimeList: Array<Record<string, any>>;
    skuId: string;
    skuNameCn: string;
    skuNameEn: string;
    start_date: string;
    stockStatus: string;
}

/**
 * @desc 加料
 */
export interface MenuGrillItem {
    grillCode: string;
    grillNameCn: string;
    grillNameEn: string;
    itemList: GrillItem[];
    maxitemCount: number;
    minItemCount: number;
}

interface GrillItem {
    maxQuantity: number;
    minQuantity: number;
    price: number;
    priceThreshold: number;
    productId: string;
    productNameCn: string;
    productNameEn: string;
    stockStatus: string;
    upLowStatus: string;
}

/**
 * @desc 规格
 */
export interface MenuSpecItem {
    defaultFlag: string;
    price: number;
    propertyClassList: any[];
    skuId: string;
    skuNameCn: string;
    skuNameEn: string;
    stockStatus: string;
    upLowStatus: string;
}

/**
 * @desc 菜单分类子项
 */
export interface MenuCategoryItem {
    categoryId: string;
    categoryIntroduction: string;
    categoryNameCn: string;
    categoryNameEn: string;
    checkedImgUrl: string;
    childCategoriesVos: Array<MenuCategoryItem> | [] | null; // 空数组或 Category 数组
    id: number;
    parentId: number;
    required: boolean;
    showFlag: number;
    sort: string;
    uncheckImgUrl: string;
}

export interface MenuResponseVo {
    categoryId: string;
    categoryName?: string;
    id: number;
    menuVoList: menuListItem[] | [];
    parentId: number;
}

export interface Menu {
    appKey: string;
    brandCode: string;
    callback: boolean;
    categoriesVos: MenuCategoryItem[] | [] | null;
    channelId: string;
    menuResponseVo: Array<MenuResponseVo>;
}

/**
 * @desc 常量列表参数
 */
export interface MenuConstantsItem {
    type: string;
    name: string;
    icon?: string;
}
