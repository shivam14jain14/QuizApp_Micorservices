package com.shivam.userapigateway.model;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email")
        }
)
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false, unique = true)
    private String username;
    private String password;
    @JsonAlias({"firstName", "first_name"})
    private String firstname;
    @JsonAlias({"lastName", "last_name"})
    private String lastname;
    @Column(nullable = false, unique = true)
    private String email;
    @JsonAlias({"phoneNumber", "phone_number"})
    private String phone;
    private String batch;
    private String role;
    private String requestedRole;

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getEmail() {
        return email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public String getBatch() {
        return batch;
    }

    public String getFirstname() {
        return firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public String getPhone() {
        return phone;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setRequestedRole(String requestedRole) {
        this.requestedRole = requestedRole;
    }
}
