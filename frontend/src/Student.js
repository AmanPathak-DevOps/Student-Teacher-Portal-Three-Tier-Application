// Student.js — FINAL CLEAN & CORRECT VERSION
import React, { useState, useEffect } from 'react';
import './Student.css';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Heading,
  Input,
  FormLabel,
  FormControl,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  useToast,
  Text,
} from '@chakra-ui/react';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';

function Student() {
  const [studentData, setStudentData] = useState({ name: '', rollNo: '', class: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // 🔥 API base (browser-friendly, no Docker name)
  const API_BASE_URL = '/api';

  /* ---------------- FETCH STUDENTS ---------------- */
  const getData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/student`);
      const json = await res.json();

      // ✅ Empty array is NOT an error
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error('Fetch students error:', err);
      // ❌ No error toast here (system is working)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/addstudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      toast({ title: 'Student added', status: 'success' });
      setStudentData({ name: '', rollNo: '', class: '' });
      getData();
    } catch (err) {
      console.error('Add student error:', err);
      toast({ title: 'Error adding student', status: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/student/${id}`, { method: 'DELETE' });
      toast({ title: 'Deleted', status: 'info' });
      getData();
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: 'Delete failed', status: 'error' });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Box>
      <Helmet>
        <title>Students • Student–Teacher Portal</title>
      </Helmet>

      <Heading mb={6}>Store Student Details</Heading>

      <Box as="form" onSubmit={handleSubmit} mb={8} maxW="lg">
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              value={studentData.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Roll No</FormLabel>
            <Input
              name="rollNo"
              value={studentData.rollNo}
              onChange={handleChange}
              placeholder="Enter roll number"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Class</FormLabel>
            <Input
              name="class"
              value={studentData.class}
              onChange={handleChange}
              placeholder="Enter class"
            />
          </FormControl>

          <HStack>
            <Button type="submit" colorScheme="teal">
              Save
            </Button>
          </HStack>
        </VStack>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState title="No students" subtitle="Add your first student to see it here." />
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Roll No</Th>
                <Th>Name</Th>
                <Th>Class</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((d, i) => {
                const roll = d.roll_number || d.rollNo || `#${i + 1}`;
                const name = d.name || '—';
                const className = d.class || '—';
                const id = d.id;

                return (
                  <Tr key={id}>
                    <Td fontWeight="bold">{roll}</Td>
                    <Td>{name}</Td>
                    <Td>{className}</Td>
                    <Td textAlign="center">
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => handleDelete(id)}
                      >
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

          <Text mt={3} fontSize="sm" color="gray.500">
            Showing {data.length} student{data.length > 1 ? 's' : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default Student;
