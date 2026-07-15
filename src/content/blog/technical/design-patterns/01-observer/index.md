---
title: "Observer Pattern"
description: "Publish/Subscribe pattern for one-to-many notification."
date: 2024-08-07
tags:
  - design-patterns
  - behavioral-patterns
kind: technical-note
series: design-patterns
order: 1
---

*又叫做 Publish/Subscribe pattern*

有 observer -> 那就存在 observable `[things]`

## Straightforward Thinking

The observer always Observe the status of the observable target.

**Representing an action: polling (in an operating system)**

```
-> O: are you done?
-> T: not yet.
-> O: are you done?
-> T: not yet...
-> O: are you done?
-> T: not yet. fuck! can you stop annoying me?
```

Moreover, there are lot of Observers.

Polling can waste a lot of resources. So... how about using a push method?

**Push / Broadcast:**

```
*after 30 minutes ...*
-> T: Hey! I'm done.
-> O: Ok!
```

## Scenario

#### 什麼時候適合用出 Observer Pattern ?

其中一方(多方)依賴於另一個對象出現某種特定狀態，就很適合

**keyword: 一對多通知**

- for instance:
    1. 上課之前專門看老師來了沒的角色 -> 老師自己快走到教室時的腳步聲
    2. 看偶像有沒有新貼文 -> 你訂閱偶像，當有新貼文時自動 broadcast

## Class Diagram

*subject -> observable target*

- **Subject Interface**: Declares methods for attaching, detaching, and notifying observers.
- **ConcreteSubject**: Implements the Subject interface and maintains the state of the subject. It notifies the observers about any changes.
- **Observer Interface**: Contains a declaration for the update() method, which is called by the Subject.
- **ConcreteObserver**: Implements the Observer interface, maintaining a reference to the ConcreteSubject. It updates itself in response to state changes.

## Case Study

### Observer class

```cpp
class Observer {
public:
    virtual void update() = 0;

protected:
    Subject* subject;
};
```

### Subject class (observable)

```cpp
class Subject {
public:
    virtual void attach(Observer* observer) = 0;
    virtual void detach(Observer* observer) = 0;
    virtual void notify() = 0;
    virtual std::string getState() = 0;

protected:
    std::list<Observer*> observers;
};
```

### ConcreteSubject: Teacher

```cpp
class Teacher : public Subject {
public:
    void attach(Observer* observer) override{
        observers.push_back(observer);
    }

    void detach(Observer* observer) override {
        observers.remove(observer);
    }

    void notify() override {
        for (auto observer : observers) {
            observer->update();
        }
    }

    void is_coming() {
        std::cout << "Teacher is coming" << std::endl;
        notify();
    }

    std::string getState() override {
        return "I'm coming";
    }
};
```

### ConcreteObserver: Student

```cpp
class Student : public Observer {
public:
    Student(Subject* subject) {
        this->subject = subject;
        subject->attach(this);
    }
    void update() {std::cout << subject->getState() << std::endl;}
private:
    Subject* subject;
};
```

## Question

#### case1:

```cpp
int main(){
    Teacher teacher;
    Student student1(&teacher);
    Student student2(&teacher);
    teacher.is_coming();

    return 0;
}
```

#### case2:

```cpp
int main() {
    Teacher teacher;
    Student student1(&teacher);
    Student student2(&teacher);
    teacher.attach(&student1);
    teacher.attach(&student2);
    teacher.is_coming();

    return 0;
}
```

## Pros & Cons

### Pros
- Decoupling
- Dynamic Subscription
- Broadcast Communication
- Scalability

### Cons
- Memory Overhead
- Performance Impact
- Unexpected Updates
- Over-notification

## Follow Up: Push vs Pull

The choice of whether the subject should push its state to the observers during notification, as opposed to observers pulling the state themselves, can depend on several factors.

### Why Pull (observers fetch state themselves)

- **Flexibility**: In some implementations, not all observers might need to know the full state of the subject. By allowing observers to pull only the specific parts of the state they care about, the Observer pattern keeps the updates flexible and efficient.

- **Decoupling**: Keeping the state fetching separate from the notification process helps to further decouple the subject from its observers. The subject doesn't need to know what data the observer needs; it just signals that there has been a change.

- **Simplicity**: By not sending state information with every notification, the subject's implementation can be kept simpler. The subject only needs to manage the list of observers and send them notifications without having to handle data packaging and distribution.

- **Observer-Controlled Updates**: This approach gives observers control over how and when they update their state. Some observers might choose to update immediately, while others might delay updating until a more appropriate time, depending on their own processing logic or priorities.

- **Network Efficiency**: In distributed systems, pushing state changes to many observers can increase network traffic and load, especially if the state data is large or changes frequently. Allowing observers to pull the state lets them optimize when and how often they synchronize with the subject, potentially reducing network usage.

### Why Push (subject sends state with notification)

- **Real-time Requirements**: For systems where observers must react immediately and with full information about changes, pushing the state might be necessary.

- **Low Bandwidth Use**: If the state is small or doesn't change in substantial ways, pushing it might not be burdensome and can simplify observer implementation.

- **Guaranteed State Coherence**: Pushing the state ensures that all observers receive exactly the same view of the subject's state at the moment of change, which can be important for consistency in some applications.
