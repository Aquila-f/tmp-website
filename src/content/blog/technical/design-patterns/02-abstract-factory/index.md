---
title: "Abstract Factory Pattern"
description: "Define factory interfaces for creating families of related objects."
date: 2024-08-28
tags:
  - design-patterns
  - creational-patterns
kind: technical-note
series: design-patterns
order: 2
---

虛擬工廠? 那我們要生產什麼?? *其實這就是 parent class 中 virtual function 的感覺*

- 相比於 factory pattern 透過單一介面管理每個類的生產
- **虛擬**工廠 更像是定義好了這個工廠具有什麼功能

此為風格工廠 (抽象)
1. art deco 裝飾藝術風格
2. victorian 維多利亞風格
3. modern 現代風格

## Scenario

**什麼時候適合用 Abstract Factory Pattern?**

當今天有很多不同的角色，都需要做同樣類型的事情，那就很適合用 Abstract Factory Pattern

### 黑悟空

- 滑鼠左鍵: 金箍棒變長往前打
- 上鍵: 三隻腳走路 (搭配額外一根)

但悟空會72變... 今天多了一變 (變形金剛)

- 滑鼠左鍵:
    - 黑悟空: 金箍棒變長往前打
    - 金剛: 手臂變成砲管 發射飛彈
- 上鍵:
    - 黑悟空: 三隻腳走路 (搭配額外一根)
    - 金剛: 腳噴氣 起飛

## Case Study

### Without Pattern

```cpp
void user_press_left_bottom(std::string character) {
    if (character == "Wukong") {
        std::cout << "Wukong attack" << std::endl;
    } else (character == "Optimus") {
        std::cout << "Optimus Prime attack" << std::endl;
    }
}

void user_press_up() {
    if (character == "Wukong") {
        std::cout << "Wukong jump" << std::endl;
    } else (character == "Optimus") {
        std::cout << "Optimus Prime fly" << std::endl;
    }
}
```

### With Abstract Factory Pattern

```cpp
class Character {
public:
    virtual void attack() = 0;
    virtual void move() = 0;
};

class Wukong : public Character {
public:
    void attack() override {std::cout << "Wukong attack" << std::endl;}
    void move() override {std::cout << "Wukong jump" << std::endl;}
};

class Transformer : public Character {
public:
    void attack() override {std::cout << "Optimus Prime attack" << std::endl;}
    void move() override {std::cout << "Optimus Prime fly" << std::endl;}
};

void user_press_left_bottom(Character* character) {
    character->attack();
}

void user_press_up(Character* character) {
    character->move();
}
```

## Pros & Cons

### Pros

- You can be sure that the products you're getting from a factory are compatible with each other.
- You avoid tight coupling between concrete products and client code.
- Single Responsibility Principle. You can extract the product creation code into one place, making the code easier to support.
- Open/Closed Principle. You can introduce new variants of products without breaking existing client code.

### Cons

The code may become more complicated than it should be, since a lot of new interfaces and classes are introduced along with the pattern.
