package com.cabbooking.service;

import com.cabbooking.entity.Customer;
import com.cabbooking.exception.BadRequestException;
import com.cabbooking.exception.ResourceNotFoundException;
import com.cabbooking.repository.CustomerRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer create(Customer customer) {
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new BadRequestException("Email already registered: " + customer.getEmail());
        }
        customer.setId(null);
        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<Customer> getAll() {
        return customerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Customer getById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
    }

    public Customer update(Long id, Customer updated) {
        Customer existing = getById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        return customerRepository.save(existing);
    }

    public void delete(Long id) {
        customerRepository.delete(getById(id));
    }
}
