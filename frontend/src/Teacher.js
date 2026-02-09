// Teacher.js — FINAL CLEAN & CORRECT VERSION
import React, { useState, useEffect } from 'react';
import './Teacher.css';
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

function Teacher() {
  const [teacherData, setTeacherData] = useState({ name: '', subject: '', class: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // 🔥 Same API base as Student.js (browser-safe)
  const API_BASE_URL = '/api';

  /* ---------------- FETCH TEACHERS ---------------- */
  const getData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teacher`);
      const json = await res.json();

      // ✅ Empty array is NOT an error
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error('Fetch teachers error:', err);
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
    setTeacherData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/addteacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
      });

      toast({ title: 'Teacher added', status: 'success' });
      setTeacherData({ name: '', subject: '', class: '' });
      getData();
    } catch (err) {
      console.error('Add teacher error:', err);
      toast({ title: 'Error adding teacher', status: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/teacher/${id}`, { method: 'DELETE' });
      toast({ title: 'Deleted', status: 'info' });
      getData();
    } catch (err) {
      console.error('Delete teacher error:', err);
      toast({ title: 'Delete failed', status: 'error' });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Box>
      <Helmet>
        <title>Teachers • Student–Teacher Portal</title>
      </Helmet>

      <Heading mb={6}>Store Teacher Details</Heading>

      <Box as="form" onSubmit={handleSubmit} mb={8} maxW="lg">
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              value={teacherData.name}
              onChange={handleChange}
              placeholder="Enter teacher name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Subject</FormLabel>
            <Input
              name="subject"
              value={teacherData.subject}
              onChange={handleChange}
              placeholder="Enter subject"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Class</FormLabel>
            <Input
              name="class"
              value={teacherData.class}
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
        <EmptyState title="No teachers" subtitle="Add your first teacher to see it here." />
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Subject</Th>
                <Th>Class</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((d) => {
                const id = d.id;
                const name = d.name || '—';
                const subject = d.subject || '—';
                const className = d.class || '—';

                return (
                  <Tr key={id}>
                    <Td fontWeight="bold">{id}</Td>
                    <Td>{name}</Td>
                    <Td>{subject}</Td>
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
            Showing {data.length} teacher{data.length > 1 ? 's' : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default Teacher;
