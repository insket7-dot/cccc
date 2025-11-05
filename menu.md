### 菜单加购逻辑

#### 操作逻辑
1. 菜单列表操作
   1. 点击加购打开详情页面
   2. 点击减号打开购物车列表页面
   3. 点击菜单列打开详情页面
2. 详情页操作
   1. 单品需选择规格和所有的加料（单选）
   2. 套餐需选择所有的轮次单品（单选）
   3. 数量操作
   4. 加入购物车操作
3. 购物车列表操作
   1. 点击底部总览打开购物车列表页面
   2. 点击内部加减可以添加减少当前已固定商品的数量
   3. 若减少到最后一个购物车服务会返回删除表示


#### 加购交互流程

```mermaid
sequenceDiagram
    participant MENU as Menu Page
    participant DETAIL as Detail Component
    participant MenuS as Menu Service
    participant CartS as Cart Service
    participant SubtotalS as Subtotal Service
    participant PriceS as Price Service

    rect rgb(230, 245, 255)
        Note over MENU,CartS: 🛒 加购流程
        MenuS->>MENU: 获取菜单数据
        MENU->>DETAIL: 点击加购操作,传输菜单数据
        DETAIL->>CartS: 调用购物车服务的加购方法
        CartS->>SubtotalS: 加购后计算购物车当前商品小计
        SubtotalS->>PriceS: 调用精密计算服务
        PriceS->>SubtotalS: 返回计算结果
        SubtotalS->>CartS: 返回小计结果
        CartS->>MenuS: 返回购物车列表数据
        MenuS->>MENU: 刷新菜单列表
        CartS->>MENU: 刷新购物车数据
    end
    rect rgb(255, 240, 230)
        Note over DETAIL,SubtotalS: 🔄 详情页实时修改数量计算
        DETAIL->>SubtotalS: 修改数量，调用实时计算小计服务
        SubtotalS->>PriceS: 调用精密计算服务
        PriceS->>SubtotalS: 返回计算结果
        SubtotalS->>DETAIL: 返回计算结果
    end
    rect rgb(240, 255, 240)
        Note over MENU,MenuS: ♻️ 购物车加减与刷新
        MENU->>CartS: 调用购物车的加减方法
        CartS->>SubtotalS: 调用小计服务
        SubtotalS->>PriceS: 调用精密计算服务
        PriceS->>SubtotalS: 返回计算结果
        SubtotalS->>CartS: 返回计算结果
        CartS->>MenuS: 刷新购物车数据
        MenuS->>MENU: 刷新购物车渲染数据
    end
```
