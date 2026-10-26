import  { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome as Icon } from '@expo/vector-icons'; // icons
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();
export default function HomeScreen () {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [books, setBooks] = useState<{ title: string; author: string }[]>([]);
  const [newBook, setNewBook] = useState<{ title: string; author: string }>({
    title: "",
    author: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [users, setUsers] = useState<
    { username: string; password: string; role: "user" }[]
  >([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
        const loadData = async () => {
          const storedBooks = await AsyncStorage.getItem("books");
          const storedUsers = await AsyncStorage.getItem("users");

          if (storedBooks) {
            setBooks(JSON.parse(storedBooks));
          }

          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
          }
        };

        loadData();
      }, []);

  const handleLogin = async () => {
        if (username === "admin" && password === "123") {
          setRole("admin");
          setIsLoggedIn(true);
          await AsyncStorage.setItem("isLoggedIn", "true");
          return;
        }

        const user = users.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          setRole("user");
          setIsLoggedIn(true);
          await AsyncStorage.setItem("isLoggedIn", "true");
        } else {
          alert("Неправильний логін або пароль");
        }
      };

  const handleLogout = async () => {
        setIsLoggedIn(false);
        setRole(null);
        setUsername("");
        setPassword("");

        await AsyncStorage.removeItem("isLoggedIn");
      };

    const handleRegisterUser = async () => {
        if (!newUsername.trim() || !newPassword.trim()) {
          alert("Заповніть усі поля");
          return;
        }

        if (
          newUsername.trim() === "admin" ||
          users.some((u) => u.username === newUsername.trim())
        ) {
          alert("Такий користувач уже існує");
          return;
        }

        const updatedUsers = [
          ...users,
          {
            username: newUsername.trim(),
            password: newPassword,
            role: "user" as const,
          },
        ];

        setUsers(updatedUsers);
        await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));

        setNewUsername("");
        setNewPassword("");

        alert("Користувача зареєстровано");
      };

  const handleAddBook = async () => {
    if (role !== "admin") return;
    if (newBook.title && newBook.author) {
      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);
      await AsyncStorage.setItem("books", JSON.stringify(updatedBooks));
      setNewBook({ title: "", author: "" });
    }
  };

  const handleDeleteBook = async (book: { title: string; author: string }) => {
    if (role !== "admin") return;
    const updatedBooks = books.filter((b) => b !== book);
    setBooks(updatedBooks);
    await AsyncStorage.setItem("books", JSON.stringify(updatedBooks));
  };

const handleUpdateBook = async () => {
  if (role !== "admin") return;
  if (editingIndex !== null && newBook.title.trim() && newBook.author.trim()) {
    const updatedBooks = [...books];

    updatedBooks[editingIndex] = {
      title: newBook.title,
      author: newBook.author,
    };

    setBooks(updatedBooks);
    await AsyncStorage.setItem("books", JSON.stringify(updatedBooks));

    setEditingIndex(null);
    setNewBook({ title: "", author: "" });
  }
};

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text>Login</Text>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={{ borderBottomWidth: 1, marginBottom: 10 }}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Button title="Login" onPress={handleLogin} />
      </SafeAreaView>
    );
  }

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Books"
        options={{
          tabBarIcon: () => <Icon name="book" size={20} />,
        }}
      >
        {() => (
          <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <Text>Book List</Text>
            <FlatList
              ListEmptyComponent={<Text>List is empty</Text>}
              data={books}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text>
                    {item.title} by {item.author}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    {role === "admin" && (
                      <Button
                        title="Edit"
                        onPress={() => {
                          setEditingIndex(books.indexOf(item));
                          setNewBook({
                            title: item.title,
                            author: item.author,
                          });
                        }}
                      />
                    )}
                    {role === "admin" && (
                      <Button
                        title="Delete"
                        onPress={() => handleDeleteBook(item)}
                      />
                    )}
                  </View>
                </View>
              )}
            />
            {role === "admin" && (
            <>
              <TextInput
                placeholder="Book Title"
                value={newBook.title}
                onChangeText={(text) =>
                  setNewBook({ ...newBook, title: text })
                }
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
              />

              <TextInput
                placeholder="Author"
                value={newBook.author}
                onChangeText={(text) =>
                  setNewBook({ ...newBook, author: text })
                }
                style={{ borderBottomWidth: 1, marginBottom: 20 }}
              />

              <Button
                title={editingIndex !== null ? "Update Book" : "Add Book"}
                onPress={
                  editingIndex !== null ? handleUpdateBook : handleAddBook
                }
              />
            </>
          )}
          </SafeAreaView>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: () => <Icon name="cogs" size={20} />,
        }}
      >
        {() => (
          <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <Text>Settings</Text>
            <Text>Тут будуть налаштування</Text>
            <Button title="Вийти" onPress={handleLogout} />
          </SafeAreaView>
        )}
      </Tab.Screen>
              {role === "admin" && (
          <Tab.Screen name="Users">
            {() => (
              <SafeAreaView style={{ flex: 1, padding: 20 }}>
                <Text>Реєстрація користувача</Text>

                <TextInput
                  placeholder="Username"
                  value={newUsername}
                  onChangeText={setNewUsername}
                  style={{ borderBottomWidth: 1, marginBottom: 10 }}
                />

                <TextInput
                  placeholder="Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  style={{ borderBottomWidth: 1, marginBottom: 20 }}
                />

                <Button
                  title="Зареєструвати користувача"
                  onPress={handleRegisterUser}
                />

                <Text style={{ marginTop: 20 }}>
                  Зареєстровані користувачі:
                </Text>

                <FlatList
                  data={users}
                  keyExtractor={(item) => item.username}
                  renderItem={({ item }) => (
                    <Text style={{ marginTop: 10 }}>
                      {item.username} — {item.role}
                    </Text>
                  )}
                />
              </SafeAreaView>
            )}
          </Tab.Screen>
        )}
    </Tab.Navigator>
  );
};