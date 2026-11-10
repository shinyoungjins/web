package com.portfolio.portfolio.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class homeController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello Portfolio!";
    }
}
