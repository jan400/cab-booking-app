package com.cabbooking.controller;

import com.cabbooking.entity.Customer;
import com.cabbooking.service.CustomerService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Customer create(@Valid @RequestBody Customer customer) {
        return customerService.create(customer);
    }

    @GetMapping
    public List<Customer> getAll() { return customerService.getAll(); }

    @GetMapping("/{id}")
    public Customer getById(@PathVariable Long id) { return customerService.getById(id); }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @Valid @RequestBody Customer customer) {
        return customerService.update(id, customer);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { customerService.delete(id); }
}
