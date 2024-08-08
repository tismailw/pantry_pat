"use client"

import { useState, useEffect } from "react";
import { auth, firestore } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Box, Modal, Stack, Typography, TextField, Button } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, setDoc, getDocs } from "firebase/firestore";
import SignIn from "../SignIn";

export default function Home() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User logged in:", user);
        setUser(user);
        await handleUserLogin(user);
      } else {
        console.log("No user is logged in");
        setUser(null);
        setInventory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUserLogin = async (user) => {
    console.log("Setting user state:", user);
    const userDocRef = doc(firestore, "users", user.uid);

    try {
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.log("Creating user document for:", user.uid);
        await setDoc(userDocRef, { createdAt: new Date().toISOString() });
      }
    } catch (error) {
      console.error("Error getting/setting user document:", error);
    }

    // Call updateInventory after setting the user state
    await updateInventory(user);
  };

  const updateInventory = async (user) => {
    if (!user) {
      console.log("No user is logged in, skipping inventory update");
      return;
    }

    console.log("Updating inventory for user:", user.uid);
    const userInventoryRef = collection(firestore, `users/${user.uid}/inventory`);
    try {
      const snapshot = await getDocs(userInventoryRef);
      const inventoryList = [];
      snapshot.forEach((doc) => {
        inventoryList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
      console.log("Updated inventory:", inventoryList);
    } catch (error) {
      console.error("Error getting inventory:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addItem = async (itemName) => {
    if (!user) {
      console.log("No user is logged in");
      return;
    }

    console.log("Adding item:", itemName);

    const userInventoryRef = doc(firestore, `users/${user.uid}/inventory`, itemName);
    try {
      const docSnap = await getDoc(userInventoryRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        console.log("Item exists with quantity:", quantity);
        await setDoc(userInventoryRef, { quantity: quantity + 1 });
      } else {
        console.log("Item does not exist, creating new item with quantity 1");
        await setDoc(userInventoryRef, { quantity: 1 });
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }

    await updateInventory(user);
    console.log("Inventory updated");
  };

  const removeItem = async (itemName) => {
    if (!user) {
      console.log("No user is logged in");
      return;
    }

    console.log("Removing item:", itemName);

    const userInventoryRef = doc(firestore, `users/${user.uid}/inventory`, itemName);
    try {
      const docSnap = await getDoc(userInventoryRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          console.log("Deleting item:", itemName);
          await deleteDoc(userInventoryRef);
        } else {
          console.log("Decreasing quantity of item:", itemName);
          await setDoc(userInventoryRef, { quantity: quantity - 1 });
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }

    await updateInventory(user);
    console.log("Inventory updated");
  };

  useEffect(() => {
    console.log("Inventory state updated:", inventory);
  }, [inventory]);

  const filterInventory = inventory.filter((item) => {
    console.log("Filtering item:", item); // Log each item being filtered
    return item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  console.log("Filtered inventory:", filterInventory); // Log the filtered inventory

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {console.log("Rendering component, user:", user)}
      {console.log("Rendering component, inventory:", inventory)}

      {!user ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
          <SignIn />
        </Box>
      ) : (
        <>
          <Modal open={open} onClose={handleClose}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%,-50%)"
              width={400}
              bgcolor="white"
              border="2px solid #000"
              boxShadow={24}
              p={4}
              display="flex"
              flexDirection="column"
              gap={3}
              sx={{
                transform: "translate(-50%,-50%)",
              }}
            >
              <Typography variant="h6">Add Item</Typography>
              <Stack width="100%" direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    addItem(itemName);
                    setItemName("");
                    handleClose();
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>

          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>

          <TextField
            variant="outlined"
            placeholder="search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Box border="1px solid #333">
            <Box
              width="800px"
              height="100px"
              bgcolor="#ADD8E6"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h2" color="#333">
                Inventory Columns
              </Typography>
            </Box>

            <Stack
              width="800px"
              height="300px"
              spacing={2}
              overflow="auto"
            >
              {filterInventory.length > 0 ? (
                filterInventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    display="flex"
                    flexDirection="row"
                    minHeight="150px"
                    alignItems="center"
                    justifyContent="space-between"
                    bgcolor="#f0f0f0"
                    borderBottom="1px solid #ddd"
                    padding={2}
                    gap={2}
                  >
                    <Typography variant="h3" color="#333" textAlign="center" flex={1}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>

                    <Typography variant="h3" color="#333" textAlign="center" flex={1}>
                      {quantity}
                    </Typography>

                    <Button variant="contained" onClick={() => addItem(name)}>
                      Add
                    </Button>

                    <Button variant="contained" onClick={() => removeItem(name)}>
                      Remove
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography variant="h6" color="#333" textAlign="center">
                  No items found.
                </Typography>
              )}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}
