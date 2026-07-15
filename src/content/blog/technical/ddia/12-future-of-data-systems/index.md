---
title: "Chapter 12: The Future of Data Systems"
date: 2026-01-06
tags:
  - derived-data
  - distributed-transactions
  - batch-processing
  - stream-processing
kind: technical-note
series: ddia
order: 12
---

作者的主觀想法與總結

[第十三章：資料系統的未來 – 設計資料密集型應用（第二版）](https://ddia.vonng.com/tw/ch13/)

> reliable / scalable / maintainable

> 根據我的經驗，99% 的人只需要 X" 或者 "…… 不需要 X" (???)

Base on the requrirement → 理解你的 dataflow

### 理解 dataflow:

1. derived data vs distributed transactions
2. batch vs stream
3. …

---

Single web server, Single db

→ Multi web servers, single db (水平擴展)

→ Multi web servers, single write, multi read (master, slave)

→ Multi web servers, multi db read and write (開始變得很複雜了)

## 當 through put 真的很大時

> 一致性就最大問題 與 挑戰

### **Derived data versus distributed transactions**

**分布式事務（Distributed Transactions）**

核心思想：通過協調協議（如 2PC 兩階段提交）確保多個系統同時成功或同時失敗。
特點：

- 強一致性（Strong Consistency）
- 所有參與者必須同時可用
- 需要分布式鎖，性能開銷大
- 任一節點失敗，整個事務回滾

例子：銀行轉賬時，A 扣款和 B 入賬必須作為一個原子操作完成。

**派生數據（Derived Data）**

核心思想：以事件日誌（Event Log）為單一事實來源，其他系統訂閱並異步派生出自己需要的數據視圖。

**特點**：

- 最終一致性（Eventual Consistency）
- 系統之間松耦合，可獨立擴展
- 容錯性強，某個消費者掛了不影響其他系統
- 可以重放日誌重建狀態

**例子**：用戶下單後，寫入事件流（Kafka），庫存服務、訂單服務、推薦服務各自消費事件並更新自己的數據。

OS: 使用情境呢?

- Intuition

    看似必須用分布式事務的場景

    1. 跨行轉賬
    A 銀行扣 100 元，B 銀行加 100 元 — 不能只成功一半吧？
        - 實際: TCC（Try-Confirm-Cancel）
            - Try:    預留庫存、凍結餘額（軟鎖定）。Confirm: 真正扣除。 Cancel:  釋放預留
    2. 訂單 + 庫存
    下單時扣庫存，不能超賣，也不能扣了庫存訂單沒建成。
        - 實際:  Saga 模式（補償事務）
            - 下單 → 扣庫存 → 扣款
            - 下單 → 扣庫存 → (失敗) → 補償：回滾庫存
    3. 多數據源寫入
    同時寫 MySQL 和 Elasticsearch，要保持一致。
        - 實際: MySQL → Binlog → Debezium/Canal(?) → Kafka → ES Consumer → ES

即使能用 **Derived Data** 來解強一致的複雜，但還是需要順序?

### 全序問題 Total Ordering in Derived data

1. 單一 Leader 寫入

    e.g., kafka 的 single partition

    但 threadput 降低

2. 拆分 Causal Order

    有順序的自己一個 partition

    e.g., kafka 加上 partition key

    還是有 limitation 無法做到全局全序

3. 共識演算法

    e.g., Raft

    所有事件經過 leader 排序後分發


OS: 那不就代表及使用了 Derived data 還是要處理複雜的 sync 問題?

- Intuition

    | 維度 | 分布式事務 | 派生數據 + 事件流 |
    | --- | --- | --- |
    | 順序保證 | 全局強一致（2PC 鎖定） | 分區內全序 / 因果序 |
    | 協調時機 | **寫入時**同步協調 | **寫入後**異步排序 |
    | 瓶頸 | 最慢的參與者 | 單 partition 吞吐量 |
    | 擴展性 | 差（全局鎖） | 好（按 key 分區） |

    ---

    問題類似但不相同

    ```
    分布式事務：要求所有節點「同時」看到一致狀態
                         ↓
               需要同步協調（2PC），代價大

    派生數據：  要求所有節點「最終」以相同順序處理
                         ↓
               可以異步排序，降低了協調成本
               但仍需某種形式的順序保證（單 leader / 因果序）
    ```


---

> 那 batch vs stream processing 呢?
是 batch processing 只 for 分布式 ? stream processing 只 for 派生?

Ans: no no no

---

## Stream vs Batch Processing

> 流處理 vs 批處理

keyword: Functional Programming

- Functional Programming

    [Declarative vs. Imperative](https://ithelp.ithome.com.tw/articles/10233761)

    | BASIS | FP | OOP |
    | --- | --- | --- |
    | Data | Uses immutable data. | Uses mutable data. |
    | Model | Follow a declarative programming model. | Follow an imperative programming model. |
    | Execution | The statements can be executed in any order. | The statements should be executed in particular order. |
    | Iteration | Recursion is used for iterative data. | Loops are used for iterative data. |
    | Element | The basic elements are Variables and Functions. | The basic elements are objects and methods. |
    | Use | Often be used when there are few things with more operations. | Often be used when there are many things with few operations. |

實際關係：
Batch/Stream  → 「什麼時候」處理數據（時間維度）
事務/派生    → 「如何保證」數據一致（一致性維度）

**區別**

(我一直以為 batch 很快

|  | Batch | Stream |
| --- | --- | --- |
| 數據集 | 有界（Bounded） | 無界（Unbounded） |
| 延遲 | 分鐘～小時 | 毫秒～秒 |
| 吞吐 | 極高 | 中高 |
| 容錯 | 失敗重跑整個 job | Checkpoint + 增量恢復 |
| 典型工具 | Spark, Hive, MapReduce | Kafka Streams, Flink |
| 優勢 | 吞吐量極高、資源利用率高 | 延遲低、結果即時可見 |
| 劣勢 | 結果要等、不適合實時場景 | 吞吐量有上限、狀態管理複雜 |
| 適合 | 離線分析、報表、全量重建 | 實時監控、即時同步、風控 |

如果批處理用於重新處理歷史資料，而流處理用於處理最近的更新，那麼如何將這兩者結合起來？Lambda 架構

### Lambda 架構

… todo
