// Student.js — Final fixed version
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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // console.log(`${API_BASE_URL}: ENV`);
  const getData = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/student`)
      .then((res) => res.json())
      .then((res) => {
        console.log('Fetched students:', res);
        setData(res || []);
      })
      .catch(() => toast({ title: 'Failed to load students', status: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    };
    fetch(`${API_BASE_URL}/addstudent`, requestOptions)
      .then((res) => res.json())
      .then(() => {
        toast({ title: 'Student added', status: 'success' });
        setStudentData({ name: '', rollNo: '', class: '' });
        getData();
      })
      .catch(() => toast({ title: 'Error adding student', status: 'error' }));
  };

  const handleDelete = (id) => {
    fetch(`${API_BASE_URL}/student/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
        toast({ title: 'Deleted', status: 'info' });
        getData();
      })
      .catch(() => toast({ title: 'Delete failed', status: 'error' }));
  };

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
                // ✅ handle multiple key names gracefully
                const roll =
                  d.rollNo ||
                  d.rollno ||
                  d.roll_number ||
                  d.RollNo ||
                  d.RollNumber ||
                  `#${i + 1}`;
                const name = d.name || d.studentName || '—';
                const className = d.class || d.Class || d.standard || '—';
                const id = d._id || d.id || i;

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
